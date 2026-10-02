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
