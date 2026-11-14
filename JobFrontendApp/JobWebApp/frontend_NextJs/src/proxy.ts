import { NextResponse, type NextRequest } from 'next/server';
import { GUEST_ROUTES, findRouteRule } from '@/config/routes';
import { STORAGE_KEYS, decodeSession } from '@/lib/auth/session';

/**
 * Optimistic route protection (Next.js 16 "proxy", formerly middleware).
 * Reads the JWT from the `token` cookie before the page renders:
 *  - protected route + no/expired session -> /login
 *  - protected route + wrong role         -> /unauthorized
 *  - /login or /signup while logged in    -> /
 * The backend still verifies the token on every API call.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const user = decodeSession(request.cookies.get(STORAGE_KEYS.token)?.value);

  if (GUEST_ROUTES.includes(pathname)) {
    return user ? NextResponse.redirect(new URL('/', request.url)) : NextResponse.next();
  }

  const rule = findRouteRule(pathname);
  if (!rule) return NextResponse.next();
  if (!user) return NextResponse.redirect(new URL('/login', request.url));
  if (!rule.roles.includes(user.accountType)) return NextResponse.redirect(new URL('/unauthorized', request.url));

  return NextResponse.next();
}

export const config = {
  // Skip Next internals and static files from /public.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|ico|webp)$).*)'],
};
