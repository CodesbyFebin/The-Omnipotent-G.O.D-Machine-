import { z } from 'zod';

/**
 * Typed IDs. Every entity carries a prefix so IDs are self-describing in logs
 * and audit events. This prevents a whole class of "wrong ID passed to the
 * wrong query" bugs.
 */

const idPattern = (prefix: string) =>
  new RegExp(`^${prefix}_[0-9A-HJKMNP-TV-Z]{26}$`); // prefix + ULID (Crockford)

const brand = <P extends string>(prefix: P) =>
  z
    .string()
    .regex(idPattern(prefix), `expected ${prefix}_<ULID>`)
    .brand<`${P}Id`>();

export const UserId = brand('usr');
export const OrgId = brand('org');
export const ProjectId = brand('prj');
export const RepositoryId = brand('rpo');
export const MissionId = brand('msn');
export const TaskId = brand('tsk');
export const AgentId = brand('agt');
export const AgentRunId = brand('arn');
export const ToolId = brand('tol');
export const ToolRunId = brand('trn');
export const ModelRunId = brand('mrn');
export const WorkerId = brand('wkr');
export const WorkerRunId = brand('wrn');
export const NodeId = brand('nod');
export const SandboxId = brand('sbx');
export const ArtifactId = brand('art');
export const ApprovalId = brand('apr');
export const DeploymentId = brand('dep');
export const P99ReportId = brand('p99');
export const EventId = brand('evt');
export const SecretId = brand('sec');
export const MembershipId = brand('mem');

export type UserId = z.infer<typeof UserId>;
export type OrgId = z.infer<typeof OrgId>;
export type ProjectId = z.infer<typeof ProjectId>;
export type RepositoryId = z.infer<typeof RepositoryId>;
export type MissionId = z.infer<typeof MissionId>;
export type TaskId = z.infer<typeof TaskId>;
export type AgentId = z.infer<typeof AgentId>;
export type AgentRunId = z.infer<typeof AgentRunId>;
export type ToolId = z.infer<typeof ToolId>;
export type ToolRunId = z.infer<typeof ToolRunId>;
export type ModelRunId = z.infer<typeof ModelRunId>;
export type WorkerId = z.infer<typeof WorkerId>;
export type WorkerRunId = z.infer<typeof WorkerRunId>;
export type NodeId = z.infer<typeof NodeId>;
export type SandboxId = z.infer<typeof SandboxId>;
export type ArtifactId = z.infer<typeof ArtifactId>;
export type ApprovalId = z.infer<typeof ApprovalId>;
export type DeploymentId = z.infer<typeof DeploymentId>;
export type P99ReportId = z.infer<typeof P99ReportId>;
export type EventId = z.infer<typeof EventId>;
export type SecretId = z.infer<typeof SecretId>;
export type MembershipId = z.infer<typeof MembershipId>;
