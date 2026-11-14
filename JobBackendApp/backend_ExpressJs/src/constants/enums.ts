/** Enum values — identical to the Spring Boot backend (stored as strings in MongoDB). */

export const ACCOUNT_TYPES = ['APPLICANT', 'EMPLOYER', 'ADMIN'] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

export const JOB_STATUSES = ['ACTIVE', 'CLOSED', 'DRAFT'] as const;
export type JobStatus = (typeof JOB_STATUSES)[number];

export const APPLICATION_STATUSES = ['APPLIED', 'INTERVIEWING', 'OFFERED', 'REJECTED'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const NOTIFICATION_STATUSES = ['READ', 'UNREAD'] as const;
export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];
