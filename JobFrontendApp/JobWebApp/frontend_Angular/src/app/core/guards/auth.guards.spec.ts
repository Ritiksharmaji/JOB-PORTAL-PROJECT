import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { AccountType } from '../models';
import { SessionStore } from '../state/session.store';
import { authGuard, guestGuard } from './auth.guards';

/** Builds an unsigned JWT-shaped token; jwt-decode only reads the payload. */
function fakeJwt(accountType: AccountType): string {
  const encode = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${encode({ alg: 'none' })}.${encode({ sub: 'a@b.test', id: 1, name: 'A', accountType, profileId: 1, exp })}.sig`;
}

describe('auth guards', () => {
  let session: SessionStore;
  let router: Router;

  const runAuthGuard = (roles?: AccountType[]) =>
    TestBed.runInInjectionContext(() =>
      authGuard({ data: { roles } } as unknown as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    );

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    session = TestBed.inject(SessionStore);
    router = TestBed.inject(Router);
  });

  it('redirects anonymous users to /login', () => {
    const result = runAuthGuard(['APPLICANT']) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/login');
  });

  it('redirects users with the wrong role to /unauthorized', () => {
    session.login(fakeJwt('EMPLOYER'));
    const result = runAuthGuard(['APPLICANT']) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/unauthorized');
  });

  it('allows users with a permitted role', () => {
    session.login(fakeJwt('APPLICANT'));
    expect(runAuthGuard(['APPLICANT', 'ADMIN'])).toBe(true);
  });

  it('keeps logged-in users away from guest pages', () => {
    session.login(fakeJwt('APPLICANT'));
    const result = TestBed.runInInjectionContext(() =>
      guestGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot),
    ) as UrlTree;
    expect(router.serializeUrl(result)).toBe('/');
  });
});
