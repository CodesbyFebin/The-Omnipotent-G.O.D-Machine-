import { z } from 'zod';
import {
  MissionId,
  OrgId,
  ProjectId,
  UserId,
} from './ids.js';
import {
  AutonomyLevel,
  Budget,
  IsoDateTime,
  PrivacyClass,
  RiskLevel,
} from './common.js';

export const MissionStatus = z.enum([
  'draft',
  'planned',
  'running',
  'paused',
  'verifying',
  'verified',
  'failed',
  'cancelled',
]);
export type MissionStatus = z.infer<typeof MissionStatus>;

export const AcceptanceCriterion = z.object({
  id: z.string().min(1),
  description: z.string().min(1),
  /** Which P99 gate evidences this criterion, if any. */
  evidencedBy: z.string().optional(),
});
export type AcceptanceCriterion = z.infer<typeof AcceptanceCriterion>;

export const MissionSpecification = z.object({
  summary: z.string().min(1),
  scope: z.array(z.string()).default([]),
  outOfScope: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(AcceptanceCriterion).default([]),
});
export type MissionSpecification = z.infer<typeof MissionSpecification>;

/**
 * A Mission is the top-level unit of work. Its state is authoritative in the
 * database; the fields here are the persisted schema, not the runtime context.
 * See docs/adr/0005-mission-and-event-model.md.
 */
export const Mission = z.object({
  id: MissionId,
  orgId: OrgId,
  projectId: ProjectId,
  createdBy: UserId,
  status: MissionStatus,
  autonomyLevel: AutonomyLevel,
  privacyClass: PrivacyClass,
  intent: z.string().min(1),
  specification: MissionSpecification.optional(),
  budget: Budget.optional(),
  riskLevel: RiskLevel,
  /** Root task IDs; the full DAG lives in the `tasks` table. */
  rootTaskIds: z.array(z.string()).default([]),
  createdAt: IsoDateTime,
  updatedAt: IsoDateTime,
  startedAt: IsoDateTime.optional(),
  completedAt: IsoDateTime.optional(),
});
export type Mission = z.infer<typeof Mission>;

export const CreateMissionInput = Mission.pick({
  orgId: true,
  projectId: true,
  intent: true,
  autonomyLevel: true,
  privacyClass: true,
  budget: true,
}).extend({
  specification: MissionSpecification.optional(),
});
export type CreateMissionInput = z.infer<typeof CreateMissionInput>;
