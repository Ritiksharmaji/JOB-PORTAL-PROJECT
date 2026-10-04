import type { AccountType } from '../constants/enums.js';

/** The authenticated user attached to `req.user` by the `authenticate` middleware. */
export interface AuthUser {
  id: number;
  email: string;
  name: string;
  accountType: AccountType;
  profileId: number | null;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}
