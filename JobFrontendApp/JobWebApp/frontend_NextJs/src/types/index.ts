export type AccountType = 'APPLICANT' | 'EMPLOYER' | 'ADMIN';

/** Claims carried inside the JWT returned by POST /auth/login. */
export interface JwtClaims {
  sub: string;
  id: number;
  name: string;
  accountType: AccountType;
  profileId: number;
  iat?: number;
  exp?: number;
}

/** The logged-in user as the app keeps it (decoded JWT + email). */
export interface SessionUser extends JwtClaims {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  jwt: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  accountType: AccountType;
}
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
export interface Experience {
  title: string;
  company: string;
  location: string;
  description: string;
  startDate: string;
  endDate: string;
  working: boolean;
}

export interface Certification {
  name: string;
  issuer: string;
  issueDate: string;
  certificateId: string;
}

export interface Profile {
  id: number;
  name: string;
  email: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  about?: string;
  /** Base64 encoded image (no data: prefix). */
  picture?: string;
  totalExp?: number;
  skills?: string[];
  experiences?: Experience[];
  certifications?: Certification[];
  savedJobs?: number[];
}
export interface AppNotification {
  id: number;
  userId: number;
  message: string;
  action: string;
  route: string;
  status: 'READ' | 'UNREAD';
  timestamp: string;
}

/** Client-side search criteria shared by Find Jobs and Find Talent. */
export interface SearchFilter {
  jobTitle?: string[];
  location?: string[];
  experience?: string[];
  jobType?: string[];
  skills?: string[];
  /** Salary range in LPA (Find Jobs). */
  salary?: [number, number];
  /** Experience range in years (Find Talent). */
  exp?: [number, number];
  /** Talent name search (Find Talent). */
  name?: string;
}

export type MultiFilterKey = 'jobTitle' | 'location' | 'experience' | 'jobType' | 'skills';

export type SortOption =
  | 'Relevance'
  | 'Most Recent'
  | 'Salary: Low to High'
  | 'Salary: High to Low'
  | 'Experience: Low to High'
  | 'Experience: High to Low';
