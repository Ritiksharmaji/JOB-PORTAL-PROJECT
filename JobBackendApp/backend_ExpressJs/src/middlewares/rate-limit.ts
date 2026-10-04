import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';
import { ERROR_MESSAGES } from '../constants/messages.js';

const message = () => ({ errorMessage: ERROR_MESSAGES.TOO_MANY_REQUESTS, errorCode: 429, timeStamp: new Date().toISOString() });

/** Brute-force protection for login / register (per IP). Disabled in tests. */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  message,
});

/** OTP endpoints are stricter: they send emails and guard password resets. */
export const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  message,
});
