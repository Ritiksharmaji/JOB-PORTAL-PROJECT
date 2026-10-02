import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SessionStore } from '../state/session.store';

/** Attaches `Authorization: Bearer <token>` to every request when logged in. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(SessionStore).token();
  return next(token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req);
};
