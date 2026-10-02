export type JobStatus = 'ACTIVE' | 'DRAFT' | 'CLOSED';
export type ApplicationStatus = 'APPLIED' | 'INTERVIEWING' | 'OFFERED' | 'REJECTED';

export interface Applicant {
  applicantId: number;
  name: string;
  email: string;
  phone?: number | string;
  website?: string;
  /** Base64 encoded PDF (no data: prefix). */
  resume?: string;
  coverLetter?: string;
  timestamp?: string;
  applicationStatus: ApplicationStatus;
  interviewTime?: string;
}

export interface Job {
  id: number;
  jobTitle: string;
  company: string;
  applicants?: Applicant[];
  about: string;
  experience: string;
  jobType: string;
  location: string;
  packageOffered: number;
  postTime: string;
  /** Rich-text HTML. */
  description: string;
  skillsRequired: string[];
  jobStatus: JobStatus;
  postedBy: number;
}

/** Payload for POST /jobs/post (create or update). */
export type JobPayload = Omit<Job, 'id' | 'postTime' | 'applicants'> & { id?: number | string };

/** Payload for POST /jobs/apply/{id}. */
export interface ApplicationPayload {
  applicantId: number;
  name: string;
  email: string;
  phone: number | string;
  website: string;
  resume: string;
  coverLetter: string;
}

/** Payload for POST /jobs/changeAppStatus. */
export interface ApplicationStatusUpdate {
  id: number | string;
  applicantId: number;
  applicationStatus: ApplicationStatus;
  interviewTime?: string;
}
