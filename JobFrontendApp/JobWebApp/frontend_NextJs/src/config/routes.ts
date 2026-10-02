import type { AccountType } from '@/types';

export const APPLICANT_ROLES: AccountType[] = ['APPLICANT', 'ADMIN'];
export const EMPLOYER_ROLES: AccountType[] = ['EMPLOYER', 'ADMIN'];
export const ALL_ROLES: AccountType[] = ['APPLICANT', 'EMPLOYER', 'ADMIN'];

/**
 * Which roles may open each protected route prefix. Used by `src/proxy.ts`
 * (server-side redirect) and by the header to decide which links to show.
 */
export const PROTECTED_ROUTES: { prefix: string; roles: AccountType[] }[] = [
  { prefix: '/find-jobs', roles: APPLICANT_ROLES },
  { prefix: '/jobs', roles: APPLICANT_ROLES },
  { prefix: '/apply-job', roles: APPLICANT_ROLES },
  { prefix: '/company', roles: APPLICANT_ROLES },
  { prefix: '/job-history', roles: APPLICANT_ROLES },
  { prefix: '/find-talent', roles: EMPLOYER_ROLES },
  { prefix: '/talent-profile', roles: EMPLOYER_ROLES },
  { prefix: '/post-job', roles: EMPLOYER_ROLES },
  { prefix: '/posted-jobs', roles: EMPLOYER_ROLES },
  { prefix: '/profile', roles: ALL_ROLES },
];

/** Pages only for logged-out visitors. */
export const GUEST_ROUTES = ['/login', '/signup'];

export function findRouteRule(pathname: string) {
  return PROTECTED_ROUTES.find((r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`));
}

export const NAV_LINKS: { name: string; href: string; roles: AccountType[] }[] = [
  { name: 'Find Jobs', href: '/find-jobs', roles: APPLICANT_ROLES },
  { name: 'Find Talent', href: '/find-talent', roles: EMPLOYER_ROLES },
  { name: 'Post Job', href: '/post-job/0', roles: EMPLOYER_ROLES },
  { name: 'Posted Jobs', href: '/posted-jobs/0', roles: EMPLOYER_ROLES },
  { name: 'Job History', href: '/job-history', roles: APPLICANT_ROLES },
];
