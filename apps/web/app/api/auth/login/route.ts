import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import {
  createSession,
  hashPassword,
  serializeSessionCookie,
  verifyPassword,
} from '@god/auth';
import { eq, schema, withBootstrapTx } from '@god/db';
import { isProduction } from '@/lib/env';
import { clientKey, rateLimit } from '@/lib/rate-limit';

const bodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(1024),
});

export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, 'login'));
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  const normalizedEmail = parsed.email.trim().toLowerCase();
  // Bootstrap tx: no session context exists yet, and users has RLS on.
  const rows = await withBootstrapTx((tx) =>
    tx
      .select({
        id: schema.users.id,
        passwordHash: schema.users.passwordHash,
      })
      .from(schema.users)
      .where(eq(schema.users.email, normalizedEmail))
      .limit(1),
  );

  const user = rows[0];
  // Constant-time-ish: always verify against a hash so timing doesn't leak
  // whether the account exists.
  const dummyHash = user
    ? user.passwordHash
    : await hashPassword('__dummy__________________');
  const passwordOk = await verifyPassword(parsed.password, dummyHash);
  if (!user || !passwordOk) {
    return NextResponse.json(
      { error: 'invalid_credentials' },
      { status: 401 },
    );
  }

  const { token, expiresAt } = await createSession({
    userId: user.id,
    userAgent: request.headers.get('user-agent'),
    ipAddress: (request.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || null,
  });

  const secure = isProduction();
  const cookie = serializeSessionCookie(token, {
    secure,
    maxAgeSec: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    expires: expiresAt,
  });

  return NextResponse.json(
    { ok: true },
    { status: 200, headers: { 'Set-Cookie': cookie } },
  );
}
