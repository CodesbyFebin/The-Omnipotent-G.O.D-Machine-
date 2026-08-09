/**
 * Cookie name is `__Host-` prefixed to require `Secure`, `Path=/`, no `Domain`
 * attribute — a defence against subdomain cookie injection.
 *
 * We emit the header string directly so the same helper works from Next.js
 * route handlers (where you set a header/response cookie) and from server
 * actions (which use the `cookies()` API but accept the same options shape).
 */

export const SESSION_COOKIE_NAME = '__Host-god_session';
export const SESSION_COOKIE_NAME_DEV = 'god_session_dev'; // no __Host- in HTTP dev

export interface SessionCookieOptions {
  secure: boolean;
  maxAgeSec: number;
  expires: Date;
}

export function sessionCookieName(secure: boolean): string {
  return secure ? SESSION_COOKIE_NAME : SESSION_COOKIE_NAME_DEV;
}

export function serializeSessionCookie(
  token: string,
  opts: SessionCookieOptions,
): string {
  const name = sessionCookieName(opts.secure);
  const parts = [
    `${name}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${opts.maxAgeSec}`,
    `Expires=${opts.expires.toUTCString()}`,
  ];
  if (opts.secure) parts.push('Secure');
  return parts.join('; ');
}

export function serializeSessionClearCookie(secure: boolean): string {
  const name = sessionCookieName(secure);
  const parts = [
    `${name}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
    `Expires=${new Date(0).toUTCString()}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}
