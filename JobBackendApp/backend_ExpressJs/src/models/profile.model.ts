import { Schema, model, type InferSchemaType } from 'mongoose';

const experienceSchema = new Schema(
  {
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    working: Boolean,
    description: String,
  },
  { _id: false },
);

const certificationSchema = new Schema(
  {
    name: String,
    issuer: String,
    issueDate: Date,
    certificateId: String,
  },
  { _id: false },
);

/** `profiles` collection (Spring entity: Profile). */
const profileSchema = new Schema(
  {
    _id: { type: Number, required: true },
    name: String,
    email: String,
    jobTitle: String,
    company: String,
    location: String,
    about: String,
    /** Stored as BSON binary (Spring: byte[]); sent to clients as Base64. */
    picture: Buffer,
    totalExp: Number,
    skills: { type: [String], default: undefined },
    experiences: { type: [experienceSchema], default: undefined },
    certifications: { type: [certificationSchema], default: undefined },
    savedJobs: { type: [Number], default: undefined },
  },
  { collection: 'profiles', versionKey: false },
);

export type ProfileDoc = InferSchemaType<typeof profileSchema>;
export const Profile = model('Profile', profileSchema);
