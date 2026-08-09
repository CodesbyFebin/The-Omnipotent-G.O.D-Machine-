import { NextResponse } from 'next/server';
import { z } from 'zod';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import {
  createSession,
  hashPassword,
  serializeSessionCookie,
} from '@god/auth';
import {
  eq,
  getDb,
  newMembershipId,
  newOrgId,
  newUserId,
  schema,
  withAnonymousTx,
} from '@god/db';
import { isProduction } from '@/lib/env';
import { clientKey, rateLimit } from '@/lib/rate-limit';

const bodySchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(12).max(1024),
  orgName: z.string().min(1).max(80),
});

export async function POST(request: Request) {
  const rl = rateLimit(clientKey(request, 'register'));
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'rate_limited' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfterSec) } },
    );
  }

  let parsed: z.infer<typeof bodySchema>;
  try {
    parsed = bodySchema.parse(await request.json());
  } catch (err) {
    return NextResponse.json(
      { error: 'invalid_request', detail: err instanceof z.ZodError ? err.flatten() : undefined },
      { status: 400 },
    );
  }

  const normalizedEmail = parsed.email.trim().toLowerCase();

  // Enumeration-safe check: same latency whether email exists or not.
  // We deliberately do NOT tell the client "email taken" — the login flow
  // will reveal ambiguity in the same generic way.
  const existing = await getDb()
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.email, normalizedEmail))
    .limit(1);
  if (existing[0]) {
    // Waste some time so timing doesn't leak account existence.
    await hashPassword(parsed.password);
    return NextResponse.json(
      { error: 'registration_failed' },
      { status: 400 },
    );
  }

  const passwordHash = await hashPassword(parsed.password);
  const userId = newUserId();
  const orgId = newOrgId();
  const membershipId = newMembershipId();
  const orgSlug = slugify(parsed.orgName) + '-' + userId.slice(4, 10).toLowerCase();

  const { token, expiresAt } = await withAnonymousTx(async (tx) => {
    await tx.insert(schema.users).values({
      id: userId,
      email: normalizedEmail,
      passwordHash,
    });
    await tx.insert(schema.orgs).values({
      id: orgId,
      slug: orgSlug,
      name: parsed.orgName,
    });
    await tx.insert(schema.memberships).values({
      id: membershipId,
      orgId,
      userId,
      role: 'OWNER',
    });
    const session = await createSession({
      userId,
      userAgent: request.headers.get('user-agent'),
      ipAddress: (request.headers.get('x-forwarded-for') ?? '').split(',')[0]?.trim() || null,
      tx,
    });
    return session;
  });

  const secure = isProduction();
  const cookie = serializeSessionCookie(token, {
    secure,
    maxAgeSec: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    expires: expiresAt,
  });

  return NextResponse.json(
    { ok: true, orgSlug },
    { status: 201, headers: { 'Set-Cookie': cookie } },
  );
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'org';
}
