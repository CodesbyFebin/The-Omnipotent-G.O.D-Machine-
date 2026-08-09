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

// Definitions
export const UserId = brand('usr');
export const OrgId = brand('org');
export const MembershipId = brand('mem');
export const SessionId = brand('ses');
export const ProjectId = brand('prj');
export const RepositoryId = brand('rpo');
export const MissionId = brand('msn');
export const TaskId = brand('tsk');
export const AgentId = brand('agt');
export const AgentRunId = brand('arn');
export const ToolId = brand('tol');
export const ToolRunId = brand('trn'); // tool run (external tool invocation record)
export const ModelRunId = brand('mrn'); // model run (LLM call record)
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

// Mission runtime (Phase 2A). Prefixes deliberately DO NOT collide with
// ToolRunId ('trn') or ModelRunId ('mrn'). The renaming happened in the
// Pre-P2A-010 preflight to keep the "self-describing ID" invariant true.
export const MissionRunId = brand('msr');
export const TaskRunId = brand('tsr');
export const TaskAttemptId = brand('att');
export const TaskLeaseId = brand('lse');
export const TaskResultId = brand('res');
export const EvidenceId = brand('evd');

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
export type SessionId = z.infer<typeof SessionId>;

// Mission runtime (Phase 2A)
export type MissionRunId = z.infer<typeof MissionRunId>;
export type TaskRunId = z.infer<typeof TaskRunId>;
export type TaskAttemptId = z.infer<typeof TaskAttemptId>;
export type TaskLeaseId = z.infer<typeof TaskLeaseId>;
export type TaskResultId = z.infer<typeof TaskResultId>;
export type EvidenceId = z.infer<typeof EvidenceId>;
