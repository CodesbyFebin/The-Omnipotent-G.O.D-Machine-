import { NextResponse } from 'next/server';
import {
  revokeSession,
  serializeSessionClearCookie,
} from '@god/auth';
import { getAuthContext } from '@/lib/session';
import { isProduction } from '@/lib/env';

export async function POST() {
  const auth = await getAuthContext();
  if (auth) {
    await revokeSession(auth.sessionId);
  }
  const clear = serializeSessionClearCookie(isProduction());
  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { 'Set-Cookie': clear } },
  );
}
