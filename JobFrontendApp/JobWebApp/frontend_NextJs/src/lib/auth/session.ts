import { jwtDecode } from 'jwt-decode';
import type { JwtClaims, SessionUser } from '@/types';

/** Storage keys — identical to the React app so both share the same session format. */
export const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  accountType: 'accountType',
  theme: 'theme',
} as const;

/**
 * Decodes the JWT returned by POST /auth/login into the session user.
 * Returns null for malformed or expired tokens. Works in the browser, on the
 * server and in `proxy.ts` (no signature check — the backend verifies it).
 */
export function decodeSession(token?: string | null): SessionUser | null {
  if (!token) return null;
  try {
    const claims = jwtDecode<JwtClaims>(token);
    if (claims.exp && claims.exp * 1000 < Date.now()) return null;
    return { ...claims, email: claims.sub };
  } catch {
    return null;
  }
}

// ---- Browser-only persistence (cookie for proxy/SSR + localStorage for parity with React) ----

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${secure}`;
}

export function persistSession(token: string, user: SessionUser) {
  const maxAge = user.exp ? Math.max(0, user.exp - Math.floor(Date.now() / 1000)) : 60 * 60 * 24;
  setCookie(STORAGE_KEYS.token, token, maxAge);
  try {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.accountType, user.accountType);
  } catch {
    /* storage unavailable */
  }
}

export function clearPersistedSession() {
  setCookie(STORAGE_KEYS.token, '', 0);
  try {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
    localStorage.removeItem(STORAGE_KEYS.accountType);
  } catch {
    /* storage unavailable */
  }
}

export function persistTheme(scheme: 'light' | 'dark') {
  setCookie(STORAGE_KEYS.theme, scheme, 60 * 60 * 24 * 365);
  try {
    localStorage.setItem(STORAGE_KEYS.theme, scheme);
  } catch {
    /* storage unavailable */
  }
}
