import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { and, eq, isNull, gt } from 'drizzle-orm';
import { getDb, newSessionId, schema } from '@god/db';
import type { Transaction } from '@god/db';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days rolling
const SLIDING_THRESHOLD_MS = 24 * 60 * 60 * 1000; // slide once/day at most

/** 32 raw bytes → base64url (43 chars, ~256 bits of entropy). */
export function generateSessionToken(): string {
  return randomBytes(32).toString('base64url');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function timingSafeEqualStrings(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export interface CreateSessionInput {
  userId: string;
  userAgent?: string | null;
  ipAddress?: string | null;
  tx?: Transaction;
}

export interface CreatedSession {
  token: string; // plaintext — set as cookie, then forget
  expiresAt: Date;
}

export async function createSession(
  input: CreateSessionInput,
): Promise<CreatedSession> {
  const token = generateSessionToken();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  const db = input.tx ?? getDb();
  await db.insert(schema.sessions).values({
    id: newSessionId(),
    userId: input.userId,
    tokenHash: hashToken(token),
    createdAt: now,
    lastSeenAt: now,
    expiresAt,
    userAgent: input.userAgent ?? null,
    ipAddress: input.ipAddress ?? null,
  });
  return { token, expiresAt };
}

export interface ResolvedSession {
  sessionId: string;
  userId: string;
  expiresAt: Date;
}

/** Returns null if the token is invalid, expired, or revoked. */
export async function resolveSession(
  token: string,
): Promise<ResolvedSession | null> {
  if (!token || token.length < 20) return null;
  const db = getDb();
  const tokenHash = hashToken(token);
  const now = new Date();
  const rows = await db
    .select({
      id: schema.sessions.id,
      userId: schema.sessions.userId,
      expiresAt: schema.sessions.expiresAt,
      lastSeenAt: schema.sessions.lastSeenAt,
    })
    .from(schema.sessions)
    .where(
      and(
        eq(schema.sessions.tokenHash, tokenHash),
        isNull(schema.sessions.revokedAt),
        gt(schema.sessions.expiresAt, now),
      ),
    )
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  // Slide `last_seen_at` at most once per day to keep write load down.
  const sinceLastSeenMs = now.getTime() - row.lastSeenAt.getTime();
  if (sinceLastSeenMs > SLIDING_THRESHOLD_MS) {
    await db
      .update(schema.sessions)
      .set({ lastSeenAt: now })
      .where(eq(schema.sessions.id, row.id));
  }

  return {
    sessionId: row.id,
    userId: row.userId,
    expiresAt: row.expiresAt,
  };
}

export async function revokeSession(sessionId: string): Promise<void> {
  const db = getDb();
  await db
    .update(schema.sessions)
    .set({ revokedAt: new Date() })
    .where(eq(schema.sessions.id, sessionId));
}
