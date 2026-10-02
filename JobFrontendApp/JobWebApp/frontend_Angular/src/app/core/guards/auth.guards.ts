import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AccountType } from '../models';
import { SessionStore } from '../state/session.store';

/**
 * Protects a route. Unauthenticated users go to /login; users whose role is not
 * listed in `route.data.roles` go to /unauthorized. (React: ProtectedRoute.)
 */
export const authGuard: CanActivateFn = (route) => {
  const session = inject(SessionStore);
  const router = inject(Router);

  if (!session.isLoggedIn()) return router.createUrlTree(['/login']);

  const roles = route.data['roles'] as AccountType[] | undefined;
  if (roles && !session.hasRole(roles)) return router.createUrlTree(['/unauthorized']);

  return true;
};

/** Keeps logged-in users away from /login and /signup. (React: PublicRoute.) */
export const guestGuard: CanActivateFn = () => {
  const session = inject(SessionStore);
  const router = inject(Router);
  return session.isLoggedIn() ? router.createUrlTree(['/']) : true;
};
