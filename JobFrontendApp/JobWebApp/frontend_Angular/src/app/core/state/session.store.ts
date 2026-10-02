import { Injectable, computed, signal } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { STORAGE_KEYS } from '../constants/storage-keys';
import { AccountType, JwtClaims, SessionUser } from '../models';
import { readString, removeKeys, writeJson, writeString } from '../utils/storage.utils';

/**
 * Auth session: the raw JWT plus the user decoded from it.
 * (React equivalent: JwtSlice + UserSlice.)
 */
@Injectable({ providedIn: 'root' })
export class SessionStore {
  private readonly _token = signal('');
  private readonly _user = signal<SessionUser | null>(null);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token() && !!this._user());
  readonly accountType = computed<AccountType | null>(() => this._user()?.accountType ?? null);
  readonly userId = computed(() => this._user()?.id ?? null);
  readonly profileId = computed(() => this._user()?.profileId ?? null);

  constructor() {
    // Rehydrate the session on page load; drop expired or malformed tokens.
    const stored = readString(STORAGE_KEYS.token);
    if (stored && !this.applyToken(stored)) this.logout();
  }

  /** Stores the JWT returned by /auth/login. Returns false if it cannot be decoded. */
  login(jwt: string): boolean {
    return this.applyToken(jwt);
  }

  logout(): void {
    this._token.set('');
    this._user.set(null);
    removeKeys(STORAGE_KEYS.token, STORAGE_KEYS.user, STORAGE_KEYS.accountType);
  }

  hasRole(roles: readonly AccountType[]): boolean {
    const type = this.accountType();
    return !!type && roles.includes(type);
  }

  private applyToken(jwt: string): boolean {
    try {
      const claims = jwtDecode<JwtClaims>(jwt);
      if (claims.exp && claims.exp * 1000 < Date.now()) return false;
      const user: SessionUser = { ...claims, email: claims.sub };
      this._token.set(jwt);
      this._user.set(user);
      writeString(STORAGE_KEYS.token, jwt);
      writeJson(STORAGE_KEYS.user, user);
      writeString(STORAGE_KEYS.accountType, user.accountType);
      return true;
    } catch {
      return false;
    }
  }
}
