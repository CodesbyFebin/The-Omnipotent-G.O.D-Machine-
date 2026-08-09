import { and, desc, eq } from 'drizzle-orm';
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
 * transaction, chaining `previousEventId` **per aggregate** — not per
 * mission-definition or task-definition. Two mission_runs of the same
 * mission each get their own independent event chain (see ADR-0007).
 *
 * Invariants:
 *   1. Runs inside the *same* transaction as the mutation it describes.
 *      A caller that opens a separate transaction defeats the audit
 *      guarantee.
 *   2. Validates against the DomainEvent Zod union before insert — no
 *      malformed events reach the log.
 *   3. Reads the previous event inside the transaction so concurrent
 *      appenders serialize on the aggregate.
 *   4. Denormalized `mission_id` / `task_id` columns are populated when
 *      the event has those fields, for existing read paths.
 */
export async function appendEvent(input: AppendEventInput): Promise<string> {
  const parsed = DomainEvent.parse(input.event);
  const { aggregateKind, aggregateId } = aggregateOf(parsed);
  const missionId =
    'missionId' in parsed ? (parsed.missionId as string) : null;
  const taskId = 'taskId' in parsed ? (parsed.taskId as string) : null;

  const previousEventId = await findPreviousEventId(input.tx, {
    orgId: input.orgId,
    aggregateKind,
    aggregateId,
  });

  const id =
    'id' in parsed && typeof parsed.id === 'string' ? parsed.id : newEventId();

  await input.tx.insert(schema.auditEvents).values({
    id,
    orgId: input.orgId,
    type: parsed.type,
    schemaVersion: parsed.schemaVersion,
    aggregateKind,
    aggregateId,
    missionId,
    taskId,
    previousEventId,
    event: parsed,
    occurredAt: new Date(parsed.occurredAt),
  });

  return id;
}

/**
 * Derive the aggregate identity a DomainEvent belongs to.
 *
 * Runtime safety comes from `DomainEvent.parse()` in `appendEvent()`; if a
 * variant's `type` is in the union, its declared fields are guaranteed
 * present. The `as` casts below are field-shape narrowings the compiler
 * cannot infer through a 65-variant discriminated union but that Zod has
 * already enforced. If you add a new event type, add a case here or the
 * `default` branch throws with a clear message.
 */
function aggregateOf(event: DomainEvent): {
  aggregateKind: string;
  aggregateId: string;
} {
  const t = event.type;

  // ---------- Phase 2A runtime (prefix-tested first — most specific) ----------
  if (t.startsWith('mission_run.')) {
    return {
      aggregateKind: 'mission_run',
      aggregateId: (event as { missionRunId: string }).missionRunId,
    };
  }
  if (t.startsWith('task_run.')) {
    return {
      aggregateKind: 'task_run',
      aggregateId: (event as { taskRunId: string }).taskRunId,
    };
  }
  if (t.startsWith('task_attempt.')) {
    return {
      aggregateKind: 'task_attempt',
      aggregateId: (event as { taskAttemptId: string }).taskAttemptId,
    };
  }
  if (t.startsWith('task_lease.')) {
    return {
      aggregateKind: 'task_lease',
      aggregateId: (event as { taskLeaseId: string }).taskLeaseId,
    };
  }

  // ---------- Phase 1 definitions ----------
  if (t.startsWith('task.')) {
    return {
      aggregateKind: 'task',
      aggregateId: (event as { taskId: string }).taskId,
    };
  }
  if (t.startsWith('mission.')) {
    return {
      aggregateKind: 'mission',
      aggregateId: (event as { missionId: string }).missionId,
    };
  }

  // ---------- Phase 1 side channels ----------
  if (t.startsWith('tool.')) {
    return {
      aggregateKind: 'tool_run',
      aggregateId: (event as { toolRunId: string }).toolRunId,
    };
  }
  if (t.startsWith('model.')) {
    return {
      aggregateKind: 'model_run',
      aggregateId: (event as { modelRunId: string }).modelRunId,
    };
  }
  if (t.startsWith('sandbox.')) {
    return {
      aggregateKind: 'sandbox',
      aggregateId: (event as { sandboxId: string }).sandboxId,
    };
  }
  if (t.startsWith('deployment.')) {
    return {
      aggregateKind: 'deployment',
      aggregateId: (event as { deploymentId: string }).deploymentId,
    };
  }
  if (t.startsWith('p99.')) {
    // P99 events chain per mission definition until an ADR moves them
    // onto mission_run. Choice recorded here so it's auditable.
    return {
      aggregateKind: 'mission',
      aggregateId: (event as { missionId: string }).missionId,
    };
  }
  if (t.startsWith('approval.')) {
    return {
      aggregateKind: 'approval',
      aggregateId: (event as { payload: { approvalId: string } }).payload
        .approvalId,
    };
  }

  throw new Error(`aggregateOf: unhandled event type: ${t}`);
}

async function findPreviousEventId(
  tx: Transaction,
  scope: { orgId: string; aggregateKind: string; aggregateId: string },
): Promise<string | null> {
  const rows = await tx
    .select({ id: schema.auditEvents.id })
    .from(schema.auditEvents)
    .where(
      and(
        eq(schema.auditEvents.orgId, scope.orgId),
        eq(schema.auditEvents.aggregateKind, scope.aggregateKind),
        eq(schema.auditEvents.aggregateId, scope.aggregateId),
      ),
    )
    .orderBy(desc(schema.auditEvents.occurredAt))
    .limit(1);
  return rows[0]?.id ?? null;
}
