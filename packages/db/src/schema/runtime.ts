import {
  bigint,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { missions, tasks } from './missions';
import { orgs } from './orgs';
import { users } from './users';
import {
  evidenceKindEnum,
  missionRunStatusEnum,
  taskAttemptStatusEnum,
  taskPriorityEnum,
  taskRunStatusEnum,
} from './enums';

/**
 * Phase 2A durable mission runtime. See docs/adr/0007-durable-mission-runtime.md.
 *
 * The invariant that everything here rests on:
 *   mission definition != mission run
 *   task definition    != task run != task attempt
 *
 * The `missions` and `tasks` tables from Phase 1 are DEFINITIONS. The
 * tables below are EXECUTIONS.
 */

// ---------- mission_runs ----------
export const missionRuns = pgTable(
  'mission_runs',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    missionId: text('mission_id')
      .notNull()
      .references(() => missions.id, { onDelete: 'cascade' }),
    runNumber: integer('run_number').notNull(),
    status: missionRunStatusEnum('status').notNull().default('DRAFT'),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    queuedAt: timestamp('queued_at', { withTimezone: true }),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    cancellationReason: text('cancellation_reason'),
  },
  (t) => ({
    missionRunNumberIdx: uniqueIndex('mission_runs_mission_run_number_idx').on(
      t.missionId,
      t.runNumber,
    ),
    orgStatusIdx: index('mission_runs_org_status_idx').on(t.orgId, t.status),
    statusIdx: index('mission_runs_status_idx').on(t.status),
  }),
);

// ---------- task_runs ----------
export const taskRuns = pgTable(
  'task_runs',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    missionRunId: text('mission_run_id')
      .notNull()
      .references(() => missionRuns.id, { onDelete: 'cascade' }),
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    status: taskRunStatusEnum('status').notNull().default('PENDING'),
    priority: taskPriorityEnum('priority').notNull().default('NORMAL'),
    attemptCount: integer('attempt_count').notNull().default(0),
    maxAttempts: integer('max_attempts').notNull().default(3),
    backoffBaseMs: integer('backoff_base_ms').notNull().default(1_000),
    backoffCapMs: integer('backoff_cap_ms').notNull().default(300_000),
    retryWaitUntil: timestamp('retry_wait_until', { withTimezone: true }),
    workerClass: text('worker_class'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    readyAt: timestamp('ready_at', { withTimezone: true }),
    firstLeasedAt: timestamp('first_leased_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => ({
    missionRunTaskIdx: uniqueIndex('task_runs_mission_run_id_task_id_key').on(
      t.missionRunId,
      t.taskId,
    ),
    orgIdx: index('task_runs_org_id_idx').on(t.orgId),
    missionRunIdx: index('task_runs_mission_run_idx').on(t.missionRunId),
    // Note: partial-index expression matches migration 0004.
    schedulerIdx: index('task_runs_scheduler_idx').on(
      t.status,
      t.priority,
      t.readyAt,
    ),
  }),
);

// ---------- task_attempts ----------
export const taskAttempts = pgTable(
  'task_attempts',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    taskRunId: text('task_run_id')
      .notNull()
      .references(() => taskRuns.id, { onDelete: 'cascade' }),
    attemptNumber: integer('attempt_number').notNull(),
    status: taskAttemptStatusEnum('status').notNull().default('LEASED'),
    workerId: text('worker_id').notNull(),
    workerClass: text('worker_class'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    endedAt: timestamp('ended_at', { withTimezone: true }),
    errorMessage: text('error_message'),
    errorDetails: jsonb('error_details').$type<Record<string, unknown>>(),
  },
  (t) => ({
    taskRunAttemptIdx: uniqueIndex('task_attempts_task_run_attempt_key').on(
      t.taskRunId,
      t.attemptNumber,
    ),
    orgIdx: index('task_attempts_org_id_idx').on(t.orgId),
    workerIdx: index('task_attempts_worker_idx').on(t.workerId),
    statusIdx: index('task_attempts_status_idx').on(t.status),
  }),
);

// ---------- task_leases ----------
export const taskLeases = pgTable(
  'task_leases',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    /**
     * UNIQUE on the column makes "at most one active lease per task_run" a
     * DB invariant, not an application-layer hope.
     */
    taskRunId: text('task_run_id')
      .notNull()
      .references(() => taskRuns.id, { onDelete: 'cascade' })
      .unique(),
    taskAttemptId: text('task_attempt_id')
      .notNull()
      .references(() => taskAttempts.id, { onDelete: 'cascade' }),
    workerId: text('worker_id').notNull(),
    leasedAt: timestamp('leased_at', { withTimezone: true }).notNull().defaultNow(),
    heartbeatAt: timestamp('heartbeat_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    leaseGeneration: integer('lease_generation').notNull().default(1),
  },
  (t) => ({
    expiresIdx: index('task_leases_expires_idx').on(t.expiresAt),
    workerIdx: index('task_leases_worker_idx').on(t.workerId),
  }),
);

// ---------- task_results ----------
export const taskResults = pgTable(
  'task_results',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    taskRunId: text('task_run_id')
      .notNull()
      .references(() => taskRuns.id, { onDelete: 'cascade' }),
    taskAttemptId: text('task_attempt_id')
      .notNull()
      .references(() => taskAttempts.id, { onDelete: 'cascade' })
      .unique(),
    output: jsonb('output').$type<Record<string, unknown>>().notNull(),
    contentHash: text('content_hash').notNull(),
    writtenAt: timestamp('written_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    taskRunIdx: index('task_results_task_run_idx').on(t.taskRunId),
  }),
);

// ---------- evidence ----------
export const evidence = pgTable(
  'evidence',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    missionRunId: text('mission_run_id')
      .notNull()
      .references(() => missionRuns.id, { onDelete: 'cascade' }),
    taskRunId: text('task_run_id').references(() => taskRuns.id, {
      onDelete: 'cascade',
    }),
    taskAttemptId: text('task_attempt_id').references(() => taskAttempts.id, {
      onDelete: 'cascade',
    }),
    kind: evidenceKindEnum('kind').notNull(),
    label: text('label').notNull(),
    artifactUri: text('artifact_uri'),
    content: jsonb('content').$type<Record<string, unknown>>(),
    bytes: bigint('bytes', { mode: 'bigint' }),
    contentHash: text('content_hash'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    missionRunIdx: index('evidence_mission_run_idx').on(t.missionRunId),
    taskRunIdx: index('evidence_task_run_idx').on(t.taskRunId),
    taskAttemptIdx: index('evidence_task_attempt_idx').on(t.taskAttemptId),
    kindIdx: index('evidence_kind_idx').on(t.kind),
  }),
);

// ---------- idempotency_keys ----------
export const idempotencyKeys = pgTable(
  'idempotency_keys',
  {
    key: text('key').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    taskAttemptId: text('task_attempt_id')
      .notNull()
      .references(() => taskAttempts.id, { onDelete: 'cascade' }),
    effectScope: text('effect_scope').notNull(),
    recordedResult: jsonb('recorded_result').$type<Record<string, unknown>>(),
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => ({
    orgIdx: index('idempotency_keys_org_id_idx').on(t.orgId),
    attemptIdx: index('idempotency_keys_attempt_idx').on(t.taskAttemptId),
  }),
);

// ---------- type exports ----------
export type MissionRunRow = typeof missionRuns.$inferSelect;
export type NewMissionRunRow = typeof missionRuns.$inferInsert;
export type TaskRunRow = typeof taskRuns.$inferSelect;
export type NewTaskRunRow = typeof taskRuns.$inferInsert;
export type TaskAttemptRow = typeof taskAttempts.$inferSelect;
export type NewTaskAttemptRow = typeof taskAttempts.$inferInsert;
export type TaskLeaseRow = typeof taskLeases.$inferSelect;
export type NewTaskLeaseRow = typeof taskLeases.$inferInsert;
export type TaskResultRow = typeof taskResults.$inferSelect;
export type NewTaskResultRow = typeof taskResults.$inferInsert;
export type EvidenceRow = typeof evidence.$inferSelect;
export type NewEvidenceRow = typeof evidence.$inferInsert;
export type IdempotencyKeyRow = typeof idempotencyKeys.$inferSelect;
export type NewIdempotencyKeyRow = typeof idempotencyKeys.$inferInsert;
