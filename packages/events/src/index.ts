import { and, desc, eq, isNull } from 'drizzle-orm';
import { newEventId, schema } from '@god/db';
import type { Transaction } from '@god/db';
import { DomainEvent } from '@god/schemas';

export interface AppendEventInput {
  tx: Transaction;
  orgId: string;
  event: DomainEvent;
}

/**
 * Append a validated DomainEvent to `audit_events` inside the caller's
 * transaction, chaining `previousEventId` per aggregate.
 *
 * Design invariants:
 *   1. Runs inside the *same* transaction as the mutation it describes. A
 *      caller that opens a separate transaction defeats the audit guarantee.
 *   2. Validates against the DomainEvent zod schema before insert — no
 *      malformed events reach the log.
 *   3. Reads the previous event *inside* the transaction, so concurrent
 *      appenders serialize on the aggregate.
 *
 * Returns the persisted event ID.
 */
export async function appendEvent(input: AppendEventInput): Promise<string> {
  const parsed = DomainEvent.parse(input.event);
  const missionId = 'missionId' in parsed ? parsed.missionId : null;
  const taskId = 'taskId' in parsed ? (parsed.taskId as string) : null;

  const previousEventId = await findPreviousEventId(input.tx, {
    orgId: input.orgId,
    missionId,
    taskId,
  });

  const id = ('id' in parsed && typeof parsed.id === 'string')
    ? parsed.id
    : newEventId();

  await input.tx.insert(schema.auditEvents).values({
    id,
    orgId: input.orgId,
    type: parsed.type,
    schemaVersion: parsed.schemaVersion,
    missionId,
    taskId,
    previousEventId,
    event: parsed,
    occurredAt: new Date(parsed.occurredAt),
  });

  return id;
}

async function findPreviousEventId(
  tx: Transaction,
  scope: { orgId: string; missionId: string | null; taskId: string | null },
): Promise<string | null> {
  const conditions = [eq(schema.auditEvents.orgId, scope.orgId)];
  if (scope.taskId) {
    conditions.push(eq(schema.auditEvents.taskId, scope.taskId));
  } else if (scope.missionId) {
    conditions.push(eq(schema.auditEvents.missionId, scope.missionId));
    conditions.push(isNull(schema.auditEvents.taskId));
  } else {
    // Org-scope event chain (approvals, etc.) — only chain within the org.
    conditions.push(isNull(schema.auditEvents.missionId));
    conditions.push(isNull(schema.auditEvents.taskId));
  }
  const rows = await tx
    .select({ id: schema.auditEvents.id })
    .from(schema.auditEvents)
    .where(and(...conditions))
    .orderBy(desc(schema.auditEvents.occurredAt))
    .limit(1);
  return rows[0]?.id ?? null;
}
