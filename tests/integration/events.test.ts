import { beforeAll, describe, expect, it } from 'vitest';
import { appendEvent } from '@god/events';
import {
  eq,
  newEventId,
  newMembershipId,
  newMissionId,
  newOrgId,
  newProjectId,
  newUserId,
  schema,
  withAuthenticatedTx,
  withBootstrapTx,
} from '@god/db';
import { hashPassword } from '@god/auth';
import { truncateAll } from './setup/db';

/**
 * P1-005 acceptance test: appendEvent chains previous_event_id per aggregate
 * and refuses to write a malformed event.
 */

let userId: string;
let orgId: string;
let projectId: string;
let missionId: string;

beforeAll(async () => {
  await truncateAll();
  userId = newUserId();
  orgId = newOrgId();
  projectId = newProjectId();
  missionId = newMissionId();

  const passwordHash = await hashPassword('correct-horse-battery-staple');

  await withBootstrapTx(async (tx) => {
    await tx
      .insert(schema.users)
      .values({ id: userId, email: 'evt@example.com', passwordHash });
    await tx
      .insert(schema.orgs)
      .values({ id: orgId, slug: 'evt-org', name: 'Evt Org' });
    await tx.insert(schema.memberships).values({
      id: newMembershipId(),
      orgId,
      userId,
      role: 'OWNER',
    });
    await tx
      .insert(schema.projects)
      .values({ id: projectId, orgId, slug: 'evt-proj', name: 'Evt Project' });
    await tx.insert(schema.missions).values({
      id: missionId,
      orgId,
      projectId,
      createdBy: userId,
      autonomyLevel: 'ASK',
      privacyClass: 'INTERNAL',
      intent: 'evt mission',
      riskLevel: 'LOW',
    });
  });
});

describe('@god/events append + previousEventId chain', () => {
  it('appends two events for the same mission and chains them', async () => {
    // Cast to `never` at the test boundary: the DomainEvent zod schema
    // uses branded string types (evtId, orgId, msnId, …) that plain
    // strings don't satisfy at compile time. `appendEvent` calls
    // DomainEvent.parse() at runtime so we still get real validation.
    const first = {
      id: newEventId(),
      orgId,
      type: 'mission.created',
      schemaVersion: 1,
      missionId,
      occurredAt: new Date().toISOString(),
      actor: { kind: 'user', userId },
      payload: { intent: 'evt mission' },
    } as never;
    const second = {
      id: newEventId(),
      orgId,
      type: 'mission.started',
      schemaVersion: 1,
      missionId,
      occurredAt: new Date().toISOString(),
      actor: { kind: 'user', userId },
      payload: {},
    } as never;

    const firstId = await withAuthenticatedTx({ userId, orgId }, (tx) =>
      appendEvent({ tx, orgId, event: first }),
    );
    const secondId = await withAuthenticatedTx({ userId, orgId }, (tx) =>
      appendEvent({ tx, orgId, event: second }),
    );

    const rows = await withAuthenticatedTx({ userId, orgId }, (tx) =>
      tx
        .select({
          id: schema.auditEvents.id,
          type: schema.auditEvents.type,
          previousEventId: schema.auditEvents.previousEventId,
        })
        .from(schema.auditEvents)
        .where(eq(schema.auditEvents.missionId, missionId)),
    );

    const firstRow = rows.find((r) => r.id === firstId);
    const secondRow = rows.find((r) => r.id === secondId);
    expect(firstRow?.previousEventId).toBeNull();
    expect(secondRow?.previousEventId).toBe(firstId);
  });

  it('rejects malformed events with a Zod parse error', async () => {
    await expect(
      withAuthenticatedTx({ userId, orgId }, (tx) =>
        appendEvent({
          tx,
          orgId,
          event: {
            // missing required fields (id, orgId in event, schemaVersion, etc.)
            type: 'mission.created',
          } as never,
        }),
      ),
    ).rejects.toThrow();
  });
});
