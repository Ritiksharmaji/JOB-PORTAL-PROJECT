import { ERROR_MESSAGES, type ErrorKey } from '../constants/messages.js';

/** Default HTTP status per error key. */
const STATUS: Partial<Record<ErrorKey, number>> = {
  USER_FOUND: 409,
  USER_NOT_FOUND: 404,
  INVALID_CREDENTIALS: 400,
  PROFILE_NOT_FOUND: 404,
  OTP_NOT_FOUND: 400,
  OTP_INCORRECT: 400,
  OTP_NOT_VERIFIED: 400,
  JOB_NOT_FOUND: 404,
  JOB_NOT_ACTIVE: 400,
  JOB_APPLIED_ALREADY: 409,
  APPLICANT_NOT_FOUND: 404,
  NOTIFICATION_NOT_FOUND: 404,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  ROUTE_NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
};

/**
 * Expected business error (the Express equivalent of Spring's JobPortalException).
 * Thrown from services and turned into `{ errorMessage, errorCode, timeStamp }` by the error handler.
 */
export class AppError extends Error {
  readonly status: number;

  constructor(key: ErrorKey, options: { status?: number; message?: string } = {}) {
    super(options.message ?? ERROR_MESSAGES[key]);
    this.name = 'AppError';
    this.status = options.status ?? STATUS[key] ?? 500;
  }

  /** 400 with the joined validation messages (like Spring's MethodArgumentNotValidException). */
  static validation(message: string): AppError {
    return new AppError('INTERNAL', { status: 400, message });
  }
}
