import { NextResponse } from 'next/server';
import {
  revokeSession,
  serializeSessionClearCookie,
} from '@god/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
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
