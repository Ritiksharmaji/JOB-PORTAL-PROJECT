import type { NextFunction, Request, Response } from 'express';
import type { AccountType } from '../constants/enums.js';
import { User } from '../models/user.model.js';
import { verifyToken } from '../services/token.service.js';
import { AppError } from '../utils/app-error.js';

/**
 * Requires `Authorization: Bearer <jwt>` (Spring: JwtAuthenticationFilter).
 * Like Spring, the user is re-loaded from the database so deleted users and
 * changed roles take effect immediately.
 */
export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) throw new AppError('UNAUTHENTICATED');

  let email: string;
  try {
    email = verifyToken(header.slice(7)).sub;
  } catch {
    throw new AppError('UNAUTHENTICATED');
  }

  const user = await User.findOne({ email }, { password: 0 }).lean();
  if (!user) throw new AppError('UNAUTHENTICATED');

  req.user = {
    id: user._id,
    email: user.email,
    name: user.name,
    accountType: user.accountType,
    profileId: user.profileId ?? null,
  };
  next();
}

/** Restricts a route to the given account types (ADMIN is always allowed). */
export function requireRole(...roles: AccountType[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const type = req.user?.accountType;
    if (!type) throw new AppError('UNAUTHENTICATED');
    if (type !== 'ADMIN' && !roles.includes(type)) throw new AppError('FORBIDDEN');
    next();
  };
}

/** For handlers behind `authenticate`: the user is guaranteed to be set. */
export function currentUser(req: Request) {
  if (!req.user) throw new AppError('UNAUTHENTICATED');
  return req.user;
}
