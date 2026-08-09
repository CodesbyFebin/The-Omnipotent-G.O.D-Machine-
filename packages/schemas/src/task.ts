import { z } from 'zod';
import { AgentId, MissionId, TaskId } from './ids.js';
import { IsoDateTime } from './common.js';

export const TaskStatus = z.enum([
  'pending',
  'blocked',
  'ready',
  'running',
  'waiting_approval',
  'retrying',
  'failed',
  'completed',
  'cancelled',
]);
export type TaskStatus = z.infer<typeof TaskStatus>;

/**
 * A Task is a node in the Mission DAG. Dependencies live in a separate
 * relation (`task_dependencies`) rather than embedded here so DAG queries can
 * be indexed at the DB layer.
 */
export const Task = z.object({
  id: TaskId,
  missionId: MissionId,
  parentTaskId: TaskId.optional(),
  title: z.string().min(1),
  description: z.string().default(''),
  status: TaskStatus,
  assignedAgentId: AgentId.optional(),
  /** Number of times this task has been retried. */
  retryCount: z.number().int().nonnegative().default(0),
  /** Machine-readable outputs from the last completed attempt. */
  outputs: z.record(z.string(), z.unknown()).default({}),
  /** IDs of artifacts produced by this task. */
  artifactIds: z.array(z.string()).default([]),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
  startedAt: IsoDateTime.optional(),
  completedAt: IsoDateTime.optional(),
});
export type Task = z.infer<typeof Task>;

export const TaskDependency = z.object({
  taskId: TaskId,
  dependsOnTaskId: TaskId,
});
export type TaskDependency = z.infer<typeof TaskDependency>;
