// Copy the monolith's MongoDB data into the microservices' databases (one per service).
//
//   SOURCE_URI=mongodb://localhost:27017 SOURCE_DB=jobportal \
//   TARGET_URI=mongodb://localhost:27018 \
//   mongosh --nodb --quiet --file tools/migrate-monolith-data.js
//
// Options (environment): DRY_RUN=1 only counts; FORCE=1 replaces data already in the target databases.
// IDs are kept, so users, profile links, job applicants and notifications still match up, and each
// service's ID sequence continues from the monolith's counter. Passwords stay bcrypt hashes, so
// everyone logs in with the same password. OTPs are not copied (they expire after 5 minutes).

const env = (k, d) => (process.env[k] !== undefined && process.env[k] !== "" ? process.env[k] : d);
const SOURCE_URI = env("SOURCE_URI", "mongodb://localhost:27017");
const SOURCE_DB = env("SOURCE_DB", "jobportal");
const TARGET_URI = env("TARGET_URI", "mongodb://localhost:27018");
const DRY_RUN = env("DRY_RUN", "") === "1";
const FORCE = env("FORCE", "") === "1";

const PLAN = [
  // [monolith collection, target database, target collection, sequence key]
  ["users", "jobportal_users", "users", "users"],
  ["profiles", "jobportal_profiles", "profiles", "profiles"],
  ["jobs", "jobportal_jobs", "jobs", "jobs"],
  ["notification", "jobportal_notifications", "notification", "notification"],
];

const src = new Mongo(SOURCE_URI).getDB(SOURCE_DB);
const dst = new Mongo(TARGET_URI);
const sourceSeq = Object.fromEntries(src.getCollection("sequence").find().toArray().map((s) => [s._id, s.seq]));

print(`Source: ${SOURCE_URI.replace(/\/\/[^@]*@/, "//***@")} / ${SOURCE_DB}`);
print(`Target: ${TARGET_URI.replace(/\/\/[^@]*@/, "//***@")}${DRY_RUN ? "   (dry run)" : ""}`);

// Refuse to overwrite unless FORCE=1.
const busy = PLAN.filter(([, db, coll]) => dst.getDB(db).getCollection(coll).countDocuments() > 0);
if (busy.length && !FORCE && !DRY_RUN) {
  print(`Target already has data in: ${busy.map(([, d, c]) => d + "." + c).join(", ")}. Re-run with FORCE=1 to replace it.`);
  quit(1);
}

let total = 0;
for (const [from, db, coll, seqKey] of PLAN) {
  const docs = src.getCollection(from).find().toArray();
  const maxId = docs.reduce((m, d) => (typeof d._id === "number" || d._id?.constructor?.name === "Long" ? Math.max(m, Number(d._id)) : m), 0);
  const seq = Math.max(Number(sourceSeq[seqKey] || 0), maxId); // never hand out an ID that already exists
  print(`  ${from.padEnd(13)} ${String(docs.length).padStart(5)} docs -> ${db}.${coll}   next id after ${seq}`);
  total += docs.length;
  if (DRY_RUN) continue;
  const target = dst.getDB(db);
  target.getCollection(coll).deleteMany({});
  for (let i = 0; i < docs.length; i += 500) target.getCollection(coll).insertMany(docs.slice(i, i + 500), { ordered: false });
  target.getCollection("sequence").updateOne({ _id: seqKey }, { $set: { seq: NumberLong(String(seq)) } }, { upsert: true });
}

if (!DRY_RUN) {
  const usersColl = dst.getDB("jobportal_users").getCollection("users");
  if (!usersColl.getIndexes().some((i) => i.key.email === 1)) usersColl.createIndex({ email: 1 }, { unique: true }); // user-service creates it too
  // Check: every user's profile and every applicant must point at a migrated user/profile.
  const users = dst.getDB("jobportal_users").users.find({}, { _id: 1, profileId: 1 }).toArray();
  const userIds = new Set(users.map((u) => Number(u._id)));
  const profileIds = new Set(dst.getDB("jobportal_profiles").profiles.find({}, { _id: 1 }).toArray().map((p) => Number(p._id)));
  const missingProfiles = users.filter((u) => u.profileId != null && !profileIds.has(Number(u.profileId))).length;
  let orphanApplicants = 0;
  dst.getDB("jobportal_jobs").jobs.find({}, { applicants: 1 }).forEach((j) =>
    (j.applicants || []).forEach((a) => { if (!userIds.has(Number(a.applicantId))) orphanApplicants++; }));
  print(`Copied ${total} documents. Users without a profile: ${missingProfiles}. Applicants without a user: ${orphanApplicants}.`);
}
