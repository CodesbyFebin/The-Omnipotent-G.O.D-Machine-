import 'server-only';
import { cookies } from 'next/headers';
import { resolveSession, sessionCookieName } from '@god/auth';
import { isProduction } from './env.js';

export interface AuthenticatedUser {
  sessionId: string;
  userId: string;
}

/**
 * Returns the caller's auth context, or null if unauthenticated.
 * Never throws — protected pages/routes are responsible for redirecting.
 */
export async function getAuthContext(): Promise<AuthenticatedUser | null> {
  const jar = await cookies();
  const name = sessionCookieName(isProduction());
  const token = jar.get(name)?.value;
  if (!token) return null;
  const session = await resolveSession(token);
  if (!session) return null;
  return { sessionId: session.sessionId, userId: session.userId };
}
