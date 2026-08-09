import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import {
  eq,
  newMembershipId,
  newMissionId,
  newOrgId,
  newProjectId,
  newUserId,
  schema,
  sql,
  withAuthenticatedTx,
  withBootstrapTx,
  withUserTx,
} from '@god/db';
import { hashPassword } from '@god/auth';
import { truncateAll } from './setup/db';

/**
 * P1-008 acceptance tests. Verifies that Row-Level Security enforces
 * cross-org denial and positive access for every table with policies.
 *
 * Fixture:
 *   Two orgs (A, B), each with an OWNER user and a viewer user in the
 *   other org. Each org has one project and one mission.
 */

interface Fixture {
  users: { aOwner: string; aViewer: string; bOwner: string };
  orgs: { a: string; b: string };
  projects: { a: string; b: string };
  missions: { a: string; b: string };
}

let fx: Fixture;

async function makePasswordHash(): Promise<string> {
  return hashPassword('correct-horse-battery-staple');
}

beforeAll(async () => {
  await truncateAll();

  const passwordHash = await makePasswordHash();

  const aOwner = newUserId();
  const aViewer = newUserId();
  const bOwner = newUserId();
  const orgA = newOrgId();
  const orgB = newOrgId();
  const projectA = newProjectId();
  const projectB = newProjectId();
  const missionA = newMissionId();
  const missionB = newMissionId();

  await withBootstrapTx(async (tx) => {
    await tx.insert(schema.users).values([
      { id: aOwner, email: 'a-owner@example.com', passwordHash },
      { id: aViewer, email: 'a-viewer@example.com', passwordHash },
      { id: bOwner, email: 'b-owner@example.com', passwordHash },
    ]);
    await tx.insert(schema.orgs).values([
      { id: orgA, slug: 'org-a', name: 'Org A' },
      { id: orgB, slug: 'org-b', name: 'Org B' },
    ]);
    await tx.insert(schema.memberships).values([
      { id: newMembershipId(), orgId: orgA, userId: aOwner, role: 'OWNER' },
      { id: newMembershipId(), orgId: orgA, userId: aViewer, role: 'VIEWER' },
      { id: newMembershipId(), orgId: orgB, userId: bOwner, role: 'OWNER' },
    ]);
    await tx.insert(schema.projects).values([
      { id: projectA, orgId: orgA, slug: 'p-a', name: 'Project A' },
      { id: projectB, orgId: orgB, slug: 'p-b', name: 'Project B' },
    ]);
    await tx.insert(schema.missions).values([
      {
        id: missionA,
        orgId: orgA,
        projectId: projectA,
        createdBy: aOwner,
        autonomyLevel: 'ASK',
        privacyClass: 'INTERNAL',
        intent: 'mission a',
        riskLevel: 'LOW',
      },
      {
        id: missionB,
        orgId: orgB,
        projectId: projectB,
        createdBy: bOwner,
        autonomyLevel: 'ASK',
        privacyClass: 'INTERNAL',
        intent: 'mission b',
        riskLevel: 'LOW',
      },
    ]);
  });

  fx = {
    users: { aOwner, aViewer, bOwner },
    orgs: { a: orgA, b: orgB },
    projects: { a: projectA, b: projectB },
    missions: { a: missionA, b: missionB },
  };
});

describe('RLS — cross-org denial (P1-008)', () => {
  it("aOwner cannot see org B's row", async () => {
    const rows = await withAuthenticatedTx(
      { userId: fx.users.aOwner, orgId: fx.orgs.a },
      (tx) => tx.select().from(schema.orgs).where(eq(schema.orgs.id, fx.orgs.b)),
    );
    expect(rows).toHaveLength(0);
  });

  it("aOwner cannot see org B's memberships", async () => {
    const rows = await withAuthenticatedTx(
      { userId: fx.users.aOwner, orgId: fx.orgs.a },
      (tx) =>
        tx
          .select()
          .from(schema.memberships)
          .where(eq(schema.memberships.orgId, fx.orgs.b)),
    );
    expect(rows).toHaveLength(0);
  });

  it("aOwner cannot see org B's project", async () => {
    const rows = await withAuthenticatedTx(
      { userId: fx.users.aOwner, orgId: fx.orgs.a },
      (tx) =>
        tx.select().from(schema.projects).where(eq(schema.projects.id, fx.projects.b)),
    );
    expect(rows).toHaveLength(0);
  });

  it("aOwner cannot see org B's mission", async () => {
    const rows = await withAuthenticatedTx(
      { userId: fx.users.aOwner, orgId: fx.orgs.a },
      (tx) =>
        tx.select().from(schema.missions).where(eq(schema.missions.id, fx.missions.b)),
    );
    expect(rows).toHaveLength(0);
  });

  it('aOwner cannot INSERT a project into org B', async () => {
    await expect(
      withAuthenticatedTx({ userId: fx.users.aOwner, orgId: fx.orgs.a }, (tx) =>
        tx.insert(schema.projects).values({
          id: newProjectId(),
          orgId: fx.orgs.b, // <-- attacker attempts cross-org write
          slug: 'malicious',
          name: 'malicious',
        }),
      ),
    ).rejects.toThrow();
  });

  it('aOwner cannot UPDATE a row in org B (zero rows affected)', async () => {
    // The update runs without error but affects zero rows because
    // RLS filters the row out of the update visibility.
    await withAuthenticatedTx(
      { userId: fx.users.aOwner, orgId: fx.orgs.a },
      async (tx) => {
        await tx
          .update(schema.orgs)
          .set({ name: 'hacked' })
          .where(eq(schema.orgs.id, fx.orgs.b));
      },
    );
    // Verify from bOwner's context that Org B's name is unchanged.
    const [row] = await withAuthenticatedTx(
      { userId: fx.users.bOwner, orgId: fx.orgs.b },
      (tx) => tx.select().from(schema.orgs).where(eq(schema.orgs.id, fx.orgs.b)),
    );
    expect(row?.name).toBe('Org B');
  });
});

describe('RLS — positive access', () => {
  it("aOwner CAN see org A's row", async () => {
    const rows = await withAuthenticatedTx(
      { userId: fx.users.aOwner, orgId: fx.orgs.a },
      (tx) => tx.select().from(schema.orgs).where(eq(schema.orgs.id, fx.orgs.a)),
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]?.name).toBe('Org A');
  });

  it('aViewer CAN see the org they belong to, cannot see the other org', async () => {
    const [own] = await withAuthenticatedTx(
      { userId: fx.users.aViewer, orgId: fx.orgs.a },
      (tx) => tx.select().from(schema.orgs).where(eq(schema.orgs.id, fx.orgs.a)),
    );
    expect(own).toBeDefined();
    const other = await withAuthenticatedTx(
      { userId: fx.users.aViewer, orgId: fx.orgs.a },
      (tx) => tx.select().from(schema.orgs).where(eq(schema.orgs.id, fx.orgs.b)),
    );
    expect(other).toHaveLength(0);
  });

  it('withUserTx lists all orgs a user belongs to (no current_org needed)', async () => {
    const rows = await withUserTx(fx.users.aOwner, (tx) =>
      tx
        .select({ orgId: schema.orgs.id })
        .from(schema.orgs)
        .innerJoin(
          schema.memberships,
          eq(schema.memberships.orgId, schema.orgs.id),
        )
        .where(eq(schema.memberships.userId, fx.users.aOwner)),
    );
    expect(rows.map((r) => r.orgId)).toEqual([fx.orgs.a]);
  });
});

describe('RLS — users self-visibility only', () => {
  it('aOwner can select their own user row but not another user', async () => {
    const self = await withUserTx(fx.users.aOwner, (tx) =>
      tx
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, fx.users.aOwner)),
    );
    expect(self).toHaveLength(1);

    const other = await withUserTx(fx.users.aOwner, (tx) =>
      tx
        .select()
        .from(schema.users)
        .where(eq(schema.users.id, fx.users.bOwner)),
    );
    expect(other).toHaveLength(0);
  });
});

describe('RLS — audit_events append-only enforcement', () => {
  it('rejects UPDATE and DELETE on audit_events', async () => {
    // Insert an event via the bootstrap tx (registration path).
    // aggregate_kind + aggregate_id are the canonical chain scope from
    // migration 0005; this test bypasses appendEvent so it must populate
    // them explicitly.
    await withBootstrapTx((tx) =>
      tx.insert(schema.auditEvents).values({
        id: 'evt_00000000000000000000000TEST',
        orgId: fx.orgs.a,
        type: 'test.event',
        schemaVersion: 1,
        aggregateKind: 'org',
        aggregateId: fx.orgs.a,
        event: { fake: true } as unknown as never,
        occurredAt: new Date(),
      }),
    );

    // Try to update from an authenticated context — RLS UPDATE policy USING (false) blocks it.
    await withAuthenticatedTx(
      { userId: fx.users.aOwner, orgId: fx.orgs.a },
      async (tx) => {
        const result = await tx.execute(
          sql`UPDATE audit_events SET type = 'tampered' WHERE org_id = ${fx.orgs.a}`,
        );
        // 0 rows updated because policy denies all UPDATE
        expect((result as unknown as { count?: number }).count ?? 0).toBe(0);
      },
    );

    await withAuthenticatedTx(
      { userId: fx.users.aOwner, orgId: fx.orgs.a },
      async (tx) => {
        const result = await tx.execute(
          sql`DELETE FROM audit_events WHERE org_id = ${fx.orgs.a}`,
        );
        expect((result as unknown as { count?: number }).count ?? 0).toBe(0);
      },
    );

    // Row is still there.
    const [row] = await withAuthenticatedTx(
      { userId: fx.users.aOwner, orgId: fx.orgs.a },
      (tx) =>
        tx
          .select()
          .from(schema.auditEvents)
          .where(eq(schema.auditEvents.id, 'evt_00000000000000000000000TEST')),
    );
    expect(row?.type).toBe('test.event');
  });
});
