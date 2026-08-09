import {
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import type { DomainEvent } from '@god/schemas';
import { orgs } from './orgs';

/**
 * Append-only audit log. The mission and task rows are projections of this
 * table; the events are the authoritative source of state transitions.
 * See ADR-0005.
 *
 * `previousEventId` chains events per aggregate for tamper-evident audit.
 * Read at write time inside the same transaction to keep the chain intact.
 */
export const auditEvents = pgTable(
  'audit_events',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    schemaVersion: integer('schema_version').notNull().default(1),
    /** Populated for events targeting a mission aggregate. */
    missionId: text('mission_id'),
    /** Populated for events targeting a task aggregate. */
    taskId: text('task_id'),
    /** Previous event in the aggregate's chain, or null for the first event. */
    previousEventId: text('previous_event_id'),
    /**
     * Full typed `DomainEvent` payload. See packages/schemas/src/events.ts.
     * Redaction happens *before* this row is inserted, not after.
     */
    event: jsonb('event').$type<DomainEvent>().notNull(),
    occurredAt: timestamp('occurred_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orgIdx: index('audit_events_org_id_idx').on(t.orgId),
    missionIdx: index('audit_events_mission_id_idx').on(t.missionId),
    taskIdx: index('audit_events_task_id_idx').on(t.taskId),
    typeIdx: index('audit_events_type_idx').on(t.type),
    occurredIdx: index('audit_events_occurred_at_idx').on(t.occurredAt),
  }),
);

export type AuditEventRow = typeof auditEvents.$inferSelect;
export type NewAuditEventRow = typeof auditEvents.$inferInsert;
