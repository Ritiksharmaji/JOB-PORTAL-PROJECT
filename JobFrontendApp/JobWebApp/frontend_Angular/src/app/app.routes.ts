import { Routes, UrlSegment } from '@angular/router';
import { ALL_ROLES, APPLICANT_ROLES, EMPLOYER_ROLES } from './core/constants/roles';
import { authGuard, guestGuard } from './core/guards/auth.guards';

/**
 * /login and /signup share ONE route config so Angular reuses the same AuthPage
 * instance when switching between them — that keeps the sliding panel animation.
 */
export function authPageMatcher(segments: UrlSegment[]) {
  return segments.length === 1 && ['login', 'signup'].includes(segments[0].path) ? { consumed: segments } : null;
}

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'JobHook',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    matcher: authPageMatcher,
    canActivate: [guestGuard],
    title: 'JobHook | Login',
    loadComponent: () => import('./features/auth/auth-page').then((m) => m.AuthPage),
  },

  // ---- Applicant routes ----
  {
    path: 'find-jobs',
    canActivate: [authGuard],
    data: { roles: APPLICANT_ROLES },
    title: 'JobHook | Find Jobs',
    loadComponent: () => import('./features/find-jobs/find-jobs-page').then((m) => m.FindJobsPage),
  },
  {
    path: 'jobs/:id',
    canActivate: [authGuard],
    data: { roles: APPLICANT_ROLES },
    title: 'JobHook | Job',
    loadComponent: () => import('./features/job-detail/job-detail-page').then((m) => m.JobDetailPage),
  },
  {
    path: 'apply-job/:id',
    canActivate: [authGuard],
    data: { roles: APPLICANT_ROLES },
    title: 'JobHook | Apply',
    loadComponent: () => import('./features/apply-job/apply-job-page').then((m) => m.ApplyJobPage),
  },
  {
    path: 'company/:name',
    canActivate: [authGuard],
    data: { roles: APPLICANT_ROLES },
    title: 'JobHook | Company',
    loadComponent: () => import('./features/company/company-page').then((m) => m.CompanyPage),
  },
  {
    path: 'job-history',
    canActivate: [authGuard],
    data: { roles: APPLICANT_ROLES },
    title: 'JobHook | Job History',
    loadComponent: () => import('./features/job-history/job-history-page').then((m) => m.JobHistoryPage),
  },

  // ---- Employer routes ----
  {
    path: 'find-talent',
    canActivate: [authGuard],
    data: { roles: EMPLOYER_ROLES },
    title: 'JobHook | Find Talent',
    loadComponent: () => import('./features/find-talent/find-talent-page').then((m) => m.FindTalentPage),
  },
  {
    path: 'talent-profile/:id',
    canActivate: [authGuard],
    data: { roles: EMPLOYER_ROLES },
    title: 'JobHook | Talent',
    loadComponent: () => import('./features/talent-profile/talent-profile-page').then((m) => m.TalentProfilePage),
  },
  {
    path: 'post-job/:id',
    canActivate: [authGuard],
    data: { roles: EMPLOYER_ROLES },
    title: 'JobHook | Post Job',
    loadComponent: () => import('./features/post-job/post-job-page').then((m) => m.PostJobPage),
  },
  {
    path: 'posted-jobs/:id',
    canActivate: [authGuard],
    data: { roles: EMPLOYER_ROLES },
    title: 'JobHook | Posted Jobs',
    loadComponent: () => import('./features/posted-jobs/posted-jobs-page').then((m) => m.PostedJobsPage),
  },

  // ---- Shared ----
  {
    path: 'profile',
    canActivate: [authGuard],
    data: { roles: ALL_ROLES },
    title: 'JobHook | Profile',
    loadComponent: () => import('./features/profile/profile-page').then((m) => m.ProfilePage),
  },
  {
    path: 'unauthorized',
    title: 'JobHook | Unauthorized',
    loadComponent: () => import('./features/errors/unauthorized-page').then((m) => m.UnauthorizedPage),
  },
  {
    path: '**',
    title: 'JobHook | Not Found',
    loadComponent: () => import('./features/errors/not-found-page').then((m) => m.NotFoundPage),
  },
];
