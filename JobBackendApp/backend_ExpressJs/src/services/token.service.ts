import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import type { AccountType } from '../constants/enums.js';

/** 10 hours — same as Spring's JWT_TOKEN_VALIDITY (36,000,000 ms). */
const TOKEN_VALIDITY_SECONDS = 36_000;

/**
 * jjwt 0.11 (used by Spring) treats the configured secret as a **Base64-encoded**
 * key. Decoding it the same way makes tokens interchangeable between the two backends
 * when they share JWT_SECRET.
 */
const signingKey = Buffer.from(env.jwtSecret, 'base64');

export interface TokenClaims {
  id: number;
  name: string;
  accountType: AccountType;
  profileId: number | null;
}

export interface VerifiedToken extends TokenClaims {
  sub: string; // email
  iat: number;
  exp: number;
}

/** HS512 token with the same claims as Spring: sub=email, id, name, accountType, profileId. */
export function signToken(email: string, claims: TokenClaims): string {
  return jwt.sign(claims, signingKey, { algorithm: 'HS512', subject: email, expiresIn: TOKEN_VALIDITY_SECONDS });
}

/** Throws if the token is malformed, tampered with or expired. */
export function verifyToken(token: string): VerifiedToken {
  return jwt.verify(token, signingKey, { algorithms: ['HS512'] }) as VerifiedToken;
}
