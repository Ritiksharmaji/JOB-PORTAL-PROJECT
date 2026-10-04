import bcrypt from 'bcryptjs';
import { randomInt } from 'node:crypto';
import { logger } from '../config/logger.js';
import { Otp } from '../models/otp.model.js';
import { Profile } from '../models/profile.model.js';
import { nextSequenceId } from '../models/sequence.model.js';
import { User } from '../models/user.model.js';
import { AppError } from '../utils/app-error.js';
import { toUserDto } from '../utils/mappers.js';
import type { LoginInput, RegisterInput } from '../validators/user.schemas.js';
import { sendOtpEmail } from './mail.service.js';
import { sendNotification } from './notification.service.js';
import { signToken } from './token.service.js';

const BCRYPT_ROUNDS = 10; // same cost as Spring's BCryptPasswordEncoder default
export const OTP_VALIDITY_MS = 5 * 60 * 1000;
/** After verification the user has this long to submit the new password. */
const PASSWORD_RESET_WINDOW_MS = 10 * 60 * 1000;

/** Creates the user and an empty profile (Spring: UserServiceImpl.registerUser + ProfileServiceImpl.createProfile). */
export async function registerUser(input: RegisterInput) {
  if (await User.exists({ email: input.email })) throw new AppError('USER_FOUND');

  const profileId = await nextSequenceId('profiles');
  await Profile.create({
    _id: profileId,
    name: input.name,
    email: input.email,
    skills: [],
    experiences: [],
    certifications: [],
  });

  const user = await User.create({
    _id: await nextSequenceId('users'),
    name: input.name,
    email: input.email,
    password: await bcrypt.hash(input.password, BCRYPT_ROUNDS),
    accountType: input.accountType,
    profileId,
  });
  return toUserDto(user.toObject());
}

/** Checks the password; returns the user document (with hash) for internal use. */
async function authenticate({ email, password }: LoginInput) {
  const user = await User.findOne({ email }).lean();
  // Same response for unknown email and wrong password, to avoid account enumeration.
  if (!user || !(await bcrypt.compare(password, user.password))) throw new AppError('INVALID_CREDENTIALS');
  return user;
}

/** POST /auth/login -> `{ jwt }`. */
export async function login(input: LoginInput): Promise<{ jwt: string }> {
  const user = await authenticate(input);
  const jwt = signToken(user.email, {
    id: user._id,
    name: user.name,
    accountType: user.accountType,
    profileId: user.profileId ?? null,
  });
  return { jwt };
}

/** POST /users/login (legacy, kept for parity): returns the user without a token. */
export async function loginUser(input: LoginInput) {
  return toUserDto(await authenticate(input));
}

export async function sendOtp(email: string): Promise<void> {
  const user = await User.findOne({ email }).lean();
  if (!user) throw new AppError('USER_NOT_FOUND');

  const otpCode = String(randomInt(0, 1_000_000)).padStart(6, '0');
  await Otp.findOneAndUpdate(
    { _id: email },
    { otpCode, creationTime: new Date(), verified: false },
    { upsert: true },
  );
  await sendOtpEmail(email, user.name, otpCode);
}

export async function verifyOtp(email: string, otp: string): Promise<void> {
  const record = await Otp.findById(email);
  if (!record || Date.now() - record.creationTime.getTime() > OTP_VALIDITY_MS) throw new AppError('OTP_NOT_FOUND');
  if (record.otpCode !== otp) throw new AppError('OTP_INCORRECT');
  record.verified = true;
  await record.save();
}

/**
 * Resets the password. Unlike the Spring version, this requires a recently verified OTP
 * for the same email — otherwise anyone could change anyone's password. The frontends
 * already call sendOtp -> verifyOtp -> changePass, so they keep working unchanged.
 */
export async function changePassword({ email, password }: LoginInput) {
  const user = await User.findOne({ email });
  if (!user) throw new AppError('USER_NOT_FOUND');

  const record = await Otp.findById(email).lean();
  const fresh = record && Date.now() - record.creationTime.getTime() < PASSWORD_RESET_WINDOW_MS;
  if (!record?.verified || !fresh) throw new AppError('OTP_NOT_VERIFIED');

  user.password = await bcrypt.hash(password, BCRYPT_ROUNDS);
  await user.save();
  await Otp.deleteOne({ _id: email }); // one-time use

  await sendNotification({ userId: user._id, action: 'Password Reset', message: 'Password Reset Successfull' });
  return { message: 'Password changed successfully.' };
}

/** Removes expired OTPs (Spring: @Scheduled removeExpiredOTPs, every minute). */
export async function removeExpiredOtps(): Promise<void> {
  const cutoff = new Date(Date.now() - PASSWORD_RESET_WINDOW_MS);
  const { deletedCount } = await Otp.deleteMany({ creationTime: { $lt: cutoff } });
  if (deletedCount) logger.info({ deletedCount }, 'Removed expired OTPs');
}
