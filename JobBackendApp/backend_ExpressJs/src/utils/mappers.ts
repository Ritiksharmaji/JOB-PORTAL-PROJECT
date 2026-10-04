/**
 * Document -> API response mappers. They produce the same JSON shape as the Spring
 * DTOs (JobDTO, ApplicantDTO, ProfileDTO, NotificationDTO): `_id` becomes `id`,
 * binary fields become Base64 strings, and absent values are `null`.
 */

/** Binary fields arrive as Buffer, BSON Binary or Uint8Array depending on the query path. */
type Binary = Buffer | { buffer: Uint8Array } | Uint8Array | null | undefined;
type Opt<T> = T | null | undefined;

// Loose input shapes: accept both hydrated documents and `.lean()` results.
interface RawApplicant {
  applicantId: number;
  name?: Opt<string>;
  email?: Opt<string>;
  phone?: Opt<number>;
  website?: Opt<string>;
  resume?: unknown;
  coverLetter?: Opt<string>;
  timestamp?: Opt<Date>;
  applicationStatus?: Opt<string>;
  interviewTime?: Opt<Date>;
}
interface RawJob {
  _id: number;
  jobTitle?: Opt<string>;
  company?: Opt<string>;
  applicants?: Opt<ArrayLike<RawApplicant> & Iterable<RawApplicant>>;
  about?: Opt<string>;
  experience?: Opt<string>;
  jobType?: Opt<string>;
  location?: Opt<string>;
  packageOffered?: Opt<number>;
  postTime?: Opt<Date>;
  description?: Opt<string>;
  skillsRequired?: Opt<string[]>;
  jobStatus?: Opt<string>;
  postedBy?: Opt<number>;
}
interface RawProfile {
  _id: number;
  name?: Opt<string>;
  email?: Opt<string>;
  jobTitle?: Opt<string>;
  company?: Opt<string>;
  location?: Opt<string>;
  about?: Opt<string>;
  picture?: unknown;
  totalExp?: Opt<number>;
  skills?: Opt<string[]>;
  experiences?: Opt<unknown[]>;
  certifications?: Opt<unknown[]>;
  savedJobs?: Opt<number[]>;
}
interface RawNotification {
  _id: number;
  userId: number;
  message?: Opt<string>;
  action?: Opt<string>;
  route?: Opt<string>;
  status?: Opt<string>;
  timestamp?: Opt<Date>;
}
interface RawUser {
  _id: number;
  name: string;
  email: string;
  accountType: string;
  profileId?: Opt<number>;
}

/** Lean documents may return Buffer, BSON Binary or Uint8Array depending on the driver path. */
export function toBase64(value: Binary): string | null {
  if (!value) return null;
  if (Buffer.isBuffer(value)) return value.toString('base64');
  if (value instanceof Uint8Array) return Buffer.from(value).toString('base64');
  if (typeof value === 'object' && 'buffer' in value) return Buffer.from(value.buffer).toString('base64');
  return null;
}

/** Base64 (with or without a `data:...;base64,` prefix) -> Buffer. */
export function fromBase64(value?: string | null): Buffer | undefined {
  if (!value) return undefined;
  return Buffer.from(value.replace(/^data:[^;]+;base64,/, ''), 'base64');
}

const n = <T>(v: T | null | undefined): T | null => (v === undefined ? null : v);

export function toApplicantDto(a: RawApplicant) {
  return {
    applicantId: a.applicantId,
    name: n(a.name),
    email: n(a.email),
    phone: n(a.phone),
    website: n(a.website),
    resume: toBase64(a.resume as Binary),
    coverLetter: n(a.coverLetter),
    timestamp: n(a.timestamp),
    applicationStatus: n(a.applicationStatus),
    interviewTime: n(a.interviewTime),
  };
}
export type ApplicantDto = ReturnType<typeof toApplicantDto>;

/** Other applicants' personal data (resume, phone, email…) is only visible to the job owner. */
export function toPublicApplicantDto(a: RawApplicant) {
  return {
    applicantId: a.applicantId,
    name: null,
    email: null,
    phone: null,
    website: null,
    resume: null,
    coverLetter: null,
    timestamp: null,
    applicationStatus: n(a.applicationStatus),
    interviewTime: null,
  };
}

export interface Viewer {
  id: number;
  accountType: string;
}

/**
 * @param viewer when given, applicants are filtered for privacy: the job owner and admins
 *               see everything, an applicant sees their own entry, others see status only.
 */
export function toJobDto(job: RawJob, viewer?: Viewer) {
  const canSeeAll = !viewer || viewer.accountType === 'ADMIN' || viewer.id === job.postedBy;
  return {
    id: job._id,
    jobTitle: n(job.jobTitle),
    company: n(job.company),
    applicants: job.applicants
      ? Array.from(job.applicants, (a) =>
          canSeeAll || a.applicantId === viewer?.id ? toApplicantDto(a) : toPublicApplicantDto(a),
        )
      : null,
    about: n(job.about),
    experience: n(job.experience),
    jobType: n(job.jobType),
    location: n(job.location),
    packageOffered: n(job.packageOffered),
    postTime: n(job.postTime),
    description: n(job.description),
    skillsRequired: n(job.skillsRequired),
    jobStatus: n(job.jobStatus),
    postedBy: n(job.postedBy),
  };
}
export type JobDto = ReturnType<typeof toJobDto>;

export function toProfileDto(p: RawProfile) {
  return {
    id: p._id,
    name: n(p.name),
    email: n(p.email),
    jobTitle: n(p.jobTitle),
    company: n(p.company),
    location: n(p.location),
    about: n(p.about),
    picture: toBase64(p.picture as Binary),
    totalExp: n(p.totalExp),
    skills: n(p.skills),
    experiences: n(p.experiences),
    certifications: n(p.certifications),
    savedJobs: n(p.savedJobs),
  };
}
export type ProfileDto = ReturnType<typeof toProfileDto>;

export function toNotificationDto(x: RawNotification) {
  return {
    id: x._id,
    userId: x.userId,
    message: n(x.message),
    action: n(x.action),
    route: n(x.route),
    status: n(x.status),
    timestamp: n(x.timestamp),
  };
}

/** Never return the password hash (Spring sets it to null). */
export function toUserDto(u: RawUser) {
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    password: null,
    accountType: u.accountType,
    profileId: n(u.profileId),
  };
}
