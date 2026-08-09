import {
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import type {
  Budget,
  MissionSpecification,
} from '@god/schemas';
import { orgs } from './orgs';
import { projects } from './projects';
import { users } from './users';
import {
  autonomyLevelEnum,
  missionStatusEnum,
  privacyClassEnum,
  riskLevelEnum,
  taskStatusEnum,
} from './enums';

export const missions = pgTable(
  'missions',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    projectId: text('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    createdBy: text('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    status: missionStatusEnum('status').notNull().default('draft'),
    autonomyLevel: autonomyLevelEnum('autonomy_level').notNull(),
    privacyClass: privacyClassEnum('privacy_class').notNull(),
    intent: text('intent').notNull(),
    specification: jsonb('specification').$type<MissionSpecification>(),
    budget: jsonb('budget').$type<Budget>(),
    riskLevel: riskLevelEnum('risk_level').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => ({
    orgIdx: index('missions_org_id_idx').on(t.orgId),
    projectIdx: index('missions_project_id_idx').on(t.projectId),
    statusIdx: index('missions_status_idx').on(t.status),
  }),
);

export const tasks = pgTable(
  'tasks',
  {
    id: text('id').primaryKey(),
    missionId: text('mission_id')
      .notNull()
      .references(() => missions.id, { onDelete: 'cascade' }),
    parentTaskId: text('parent_task_id'),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    status: taskStatusEnum('status').notNull().default('pending'),
    assignedAgentId: text('assigned_agent_id'),
    retryCount: integer('retry_count').notNull().default(0),
    outputs: jsonb('outputs').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (t) => ({
    missionIdx: index('tasks_mission_id_idx').on(t.missionId),
    statusIdx: index('tasks_status_idx').on(t.status),
  }),
);

/**
 * Task dependencies live in a separate relation so DAG queries can be
 * indexed and traversed at the DB layer without deserializing JSON.
 * See ADR-0005.
 */
export const taskDependencies = pgTable(
  'task_dependencies',
  {
    taskId: text('task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
    dependsOnTaskId: text('depends_on_task_id')
      .notNull()
      .references(() => tasks.id, { onDelete: 'cascade' }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.taskId, t.dependsOnTaskId] }),
    dependsIdx: index('task_dependencies_depends_on_idx').on(t.dependsOnTaskId),
  }),
);

export type MissionRow = typeof missions.$inferSelect;
export type NewMissionRow = typeof missions.$inferInsert;
export type TaskRow = typeof tasks.$inferSelect;
export type NewTaskRow = typeof tasks.$inferInsert;
export type TaskDependencyRow = typeof taskDependencies.$inferSelect;
