import { z } from 'zod';
import { ACCOUNT_TYPES } from '../constants/enums.js';
import { VALIDATION_MESSAGES as M } from '../constants/messages.js';

/** Same rule as Spring's UserDTO @Pattern. */
export const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,15}$/;

const email = z.string(M.EMAIL_ABSENT).trim().min(1, M.EMAIL_ABSENT).pipe(z.email(M.EMAIL_INVALID));
const password = z.string(M.PASSWORD_ABSENT).min(1, M.PASSWORD_ABSENT).regex(PASSWORD_REGEX, M.PASSWORD_INVALID);

export const registerSchema = z.object({
  name: z.string(M.NAME_ABSENT).trim().min(1, M.NAME_ABSENT),
  email,
  password,
  accountType: z.enum(ACCOUNT_TYPES).default('APPLICANT'),
});

/** POST /auth/login and /users/login. */
export const loginSchema = z.object({
  email: z.string(M.EMAIL_ABSENT).trim().min(1, M.EMAIL_ABSENT),
  password: z.string(M.PASSWORD_ABSENT).min(1, M.PASSWORD_ABSENT),
});

/** POST /users/changePass — the new password must follow the registration rule. */
export const changePasswordSchema = z.object({ email, password });

export const emailParams = z.object({ email });

export const verifyOtpParams = z.object({
  email,
  otp: z.string().regex(/^[0-9]{6}$/, M.OTP_INVALID),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
