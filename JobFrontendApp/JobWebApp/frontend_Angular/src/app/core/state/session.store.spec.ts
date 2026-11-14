import { TestBed } from '@angular/core/testing';
import { SessionStore } from './session.store';

const encode = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
const token = (expOffsetSeconds: number) =>
  `${encode({ alg: 'none' })}.${encode({
    sub: 'demo@jobhook.test',
    id: 7,
    name: 'Demo',
    accountType: 'EMPLOYER',
    profileId: 9,
    exp: Math.floor(Date.now() / 1000) + expOffsetSeconds,
  })}.sig`;

describe('SessionStore', () => {
  beforeEach(() => localStorage.clear());

  it('decodes the JWT into the session user and persists it', () => {
    const store = TestBed.inject(SessionStore);
    expect(store.login(token(3600))).toBe(true);
    expect(store.user()?.email).toBe('demo@jobhook.test');
    expect(store.accountType()).toBe('EMPLOYER');
    expect(store.profileId()).toBe(9);
    expect(localStorage.getItem('accountType')).toBe('EMPLOYER');
  });

  it('rejects malformed and expired tokens', () => {
    const store = TestBed.inject(SessionStore);
    expect(store.login('not-a-jwt')).toBe(false);
    expect(store.login(token(-60))).toBe(false);
    expect(store.isLoggedIn()).toBe(false);
  });

  it('logout clears state and storage', () => {
    const store = TestBed.inject(SessionStore);
    store.login(token(3600));
    store.logout();
    expect(store.isLoggedIn()).toBe(false);
    expect(localStorage.getItem('token')).toBeNull();
  });
});
