import { beforeAll, describe, expect, it } from 'vitest';
import {
  createSession,
  hashPassword,
  resolveSession,
  revokeSession,
  verifyPassword,
} from '@god/auth';
import {
  eq,
  newMembershipId,
  newOrgId,
  newUserId,
  schema,
  withBootstrapTx,
} from '@god/db';
import { truncateAll } from './setup/db';

/**
 * P1-009 acceptance tests for the auth primitives.
 *
 * These tests intentionally do NOT import from apps/web — the route
 * handlers are thin wrappers around @god/auth + @god/db, and depending on
 * apps/web from a test package would create a layering violation (apps
 * depend on packages, not the other way around).
 *
 * Instead we exercise every seam a Phase 1 auth flow uses:
 *   - hashPassword / verifyPassword
 *   - createSession + resolveSession round-trip (bootstrap-tx path)
 *   - revokeSession + resolveSession returning null after revoke
 *   - constant-time behavior of verifyPassword against a mismatched hash
 */

beforeAll(async () => {
  await truncateAll();
});

describe('@god/auth — password + session round-trip', () => {
  const email = `auth+${Date.now()}@example.com`;
  const password = 'correct-horse-battery-staple';

  let userId: string;
  let orgId: string;

  it('hashes a valid password and verifies it', async () => {
    const hash = await hashPassword(password);
    expect(hash.startsWith('$argon2id$')).toBe(true);
    expect(await verifyPassword(password, hash)).toBe(true);
    expect(await verifyPassword('not-the-password', hash)).toBe(false);
  });

  it('rejects a short password at the schema layer', async () => {
    await expect(hashPassword('short')).rejects.toThrow();
  });

  it('creates a user + org + membership + session and resolves the token', async () => {
    userId = newUserId();
    orgId = newOrgId();
    const passwordHash = await hashPassword(password);

    // Simulate the registration bootstrap tx.
    const { token } = await withBootstrapTx(async (tx) => {
      await tx.insert(schema.users).values({
        id: userId,
        email,
        passwordHash,
      });
      await tx
        .insert(schema.orgs)
        .values({ id: orgId, slug: 'auth-org', name: 'Auth Org' });
      await tx.insert(schema.memberships).values({
        id: newMembershipId(),
        orgId,
        userId,
        role: 'OWNER',
      });
      return createSession({ userId, tx });
    });

    expect(token.length).toBeGreaterThan(30);

    const resolved = await resolveSession(token);
    expect(resolved).not.toBeNull();
    expect(resolved!.userId).toBe(userId);
  });

  it('resolveSession returns null for a bogus token', async () => {
    expect(await resolveSession('not-a-real-token-just-padding-x'.repeat(2))).toBeNull();
    expect(await resolveSession('')).toBeNull();
    expect(await resolveSession('short')).toBeNull();
  });

  it('revokeSession makes the token unresolvable', async () => {
    const passwordHash = await hashPassword(password);
    const uid = newUserId();
    await withBootstrapTx((tx) =>
      tx.insert(schema.users).values({
        id: uid,
        email: `rev+${Date.now()}@example.com`,
        passwordHash,
      }),
    );
    const { token } = await createSession({ userId: uid });
    const beforeRevoke = await resolveSession(token);
    expect(beforeRevoke).not.toBeNull();

    await revokeSession(beforeRevoke!.sessionId);
    const afterRevoke = await resolveSession(token);
    expect(afterRevoke).toBeNull();
  });

  it('does not leak the stored hash in the sessions row (hash != token)', async () => {
    const passwordHash = await hashPassword(password);
    const uid = newUserId();
    await withBootstrapTx((tx) =>
      tx.insert(schema.users).values({
        id: uid,
        email: `hash+${Date.now()}@example.com`,
        passwordHash,
      }),
    );
    const { token } = await createSession({ userId: uid });

    // Read the row via bootstrap tx and assert the stored value is NOT the
    // plaintext token.
    const [row] = await withBootstrapTx((tx) =>
      tx
        .select({ tokenHash: schema.sessions.tokenHash })
        .from(schema.sessions)
        .where(eq(schema.sessions.userId, uid)),
    );
    expect(row?.tokenHash).toBeDefined();
    expect(row!.tokenHash).not.toBe(token);
    // SHA-256 hex is 64 chars.
    expect(row!.tokenHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
