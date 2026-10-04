import { Schema, model, type InferSchemaType } from 'mongoose';
import { APPLICATION_STATUSES, JOB_STATUSES } from '../constants/enums.js';

/** Embedded applicant (Spring entity: Applicant). */
const applicantSchema = new Schema(
  {
    applicantId: { type: Number, required: true },
    name: String,
    email: String,
    phone: Number,
    website: String,
    /** Resume PDF as BSON binary (Spring: byte[]); sent to clients as Base64. */
    resume: Buffer,
    coverLetter: String,
    timestamp: Date,
    applicationStatus: { type: String, enum: APPLICATION_STATUSES },
    interviewTime: Date,
  },
  { _id: false },
);

/** `jobs` collection (Spring entity: Job). */
const jobSchema = new Schema(
  {
    _id: { type: Number, required: true },
    jobTitle: String,
    company: String,
    applicants: { type: [applicantSchema], default: undefined },
    about: String,
    experience: String,
    jobType: String,
    location: String,
    packageOffered: Number,
    postTime: Date,
    /** Rich-text HTML from the job editor. */
    description: String,
    skillsRequired: { type: [String], default: undefined },
    jobStatus: { type: String, enum: JOB_STATUSES },
    postedBy: Number,
  },
  { collection: 'jobs', versionKey: false },
);

jobSchema.index({ postedBy: 1 });
jobSchema.index({ 'applicants.applicantId': 1, 'applicants.applicationStatus': 1 });

export type JobDoc = InferSchemaType<typeof jobSchema>;
export type ApplicantDoc = NonNullable<JobDoc['applicants']>[number];
export const Job = model('Job', jobSchema);
