/**
 * Error messages — the same texts as `application.properties` and
 * `ValidationMessages.properties` in the Spring Boot backend.
 */
export const ERROR_MESSAGES = {
  USER_FOUND: 'Email registered already.',
  USER_NOT_FOUND: 'User is not registered.',
  INVALID_CREDENTIALS: 'Invalid Credentials.',
  PROFILE_NOT_FOUND: 'Profile not found.',
  OTP_NOT_FOUND: 'OTP has been expired.',
  OTP_INCORRECT: 'OTP is incorrect.',
  OTP_NOT_VERIFIED: 'Verify the OTP sent to your email before changing the password.',
  JOB_NOT_FOUND: 'Job not found.',
  JOB_NOT_ACTIVE: 'This job is not accepting applications.',
  JOB_APPLIED_ALREADY: 'Already Applied to this Job.',
  APPLICANT_NOT_FOUND: 'Applicant not found.',
  NOTIFICATION_NOT_FOUND: 'No Notification found.',
  UNAUTHENTICATED: 'Access Denied !! Full authentication is required to access this resource',
  FORBIDDEN: 'You do not have permission to perform this action.',
  ROUTE_NOT_FOUND: 'Route not found.',
  TOO_MANY_REQUESTS: 'Too many requests, please try again later.',
  INTERNAL: 'Something went wrong. Please try again later.',
} as const;

export const VALIDATION_MESSAGES = {
  NAME_ABSENT: 'Name is null or empty.',
  EMAIL_ABSENT: 'Email is null or empty.',
  EMAIL_INVALID: 'Email is invalid.',
  PASSWORD_ABSENT: 'Password is null or empty.',
  PASSWORD_INVALID: 'Password is invalid.',
  OTP_INVALID: 'OTP is invalid.',
} as const;

export type ErrorKey = keyof typeof ERROR_MESSAGES;
