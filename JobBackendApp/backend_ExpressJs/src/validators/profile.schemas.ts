import { z } from 'zod';
import { numericId, optionalDate, optionalNumber, optionalString } from './common.js';

const experienceSchema = z.object({
  title: optionalString,
  company: optionalString,
  location: optionalString,
  startDate: optionalDate,
  endDate: optionalDate,
  working: z.boolean().nullish(),
  description: optionalString,
});

const certificationSchema = z.object({
  name: optionalString,
  issuer: optionalString,
  issueDate: optionalDate,
  certificateId: optionalString,
});

/** PUT /profiles/update body (ProfileDTO). The frontends always send the full profile. */
export const profileSchema = z.object({
  id: numericId,
  name: optionalString,
  email: optionalString,
  jobTitle: optionalString,
  company: optionalString,
  location: optionalString,
  about: optionalString,
  /** Base64 image; null/empty removes the picture. */
  picture: z.string().nullish(),
  totalExp: optionalNumber,
  skills: z.array(z.string()).nullish(),
  experiences: z.array(experienceSchema).nullish(),
  certifications: z.array(certificationSchema).nullish(),
  savedJobs: z.array(z.coerce.number().int()).nullish(),
});

export type ProfileInput = z.infer<typeof profileSchema>;
