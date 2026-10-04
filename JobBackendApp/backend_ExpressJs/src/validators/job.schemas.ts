import { z } from 'zod';
import { APPLICATION_STATUSES, JOB_STATUSES } from '../constants/enums.js';
import { numericId, optionalDate, optionalNumber, optionalString } from './common.js';

/**
 * POST /jobs/post body (JobDTO). `id` 0 / missing = create, otherwise update.
 * Drafts may be incomplete, so content fields are optional (as in Spring).
 * Unknown fields — including `applicants` and `postTime` — are ignored: the server owns them.
 */
export const jobSchema = z.object({
  id: optionalNumber,
  jobTitle: optionalString,
  company: optionalString,
  about: optionalString,
  experience: optionalString,
  jobType: optionalString,
  location: optionalString,
  packageOffered: optionalNumber,
  description: optionalString,
  skillsRequired: z.array(z.string()).nullish(),
  jobStatus: z.enum(JOB_STATUSES).default('ACTIVE'),
  postedBy: optionalNumber,
});

/** POST /jobs/apply/:id body (ApplicantDTO). `applicantId` is taken from the JWT. */
export const applySchema = z.object({
  name: optionalString,
  email: optionalString,
  phone: optionalNumber,
  website: optionalString,
  /** Base64 PDF (no `data:` prefix required). */
  resume: optionalString,
  coverLetter: optionalString,
});

/** POST /jobs/changeAppStatus body (Application). */
export const changeStatusSchema = z.object({
  id: numericId,
  applicantId: numericId,
  applicationStatus: z.enum(APPLICATION_STATUSES),
  interviewTime: optionalDate,
});

export const historyParams = z.object({
  id: numericId,
  applicationStatus: z.enum(APPLICATION_STATUSES),
});

export type JobInput = z.infer<typeof jobSchema>;
export type ApplyInput = z.infer<typeof applySchema>;
export type ChangeStatusInput = z.infer<typeof changeStatusSchema>;
