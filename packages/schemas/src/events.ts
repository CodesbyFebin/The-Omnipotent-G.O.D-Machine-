import { z } from 'zod';
import {
  AgentRunId,
  ApprovalId,
  DeploymentId,
  EventId,
  MissionId,
  MissionRunId,
  ModelRunId,
  OrgId,
  P99ReportId,
  SandboxId,
  TaskAttemptId,
  TaskId,
  TaskLeaseId,
  TaskRunId,
  ToolRunId,
  UserId,
} from './ids';
import { IsoDateTime } from './common';

/**
 * Typed domain events. Persisted append-only in `audit_events`. The mission /
 * task rows are projections of these events. See ADR-0005.
 *
 * Rules:
 *   - `type` is stable. Renames require a new type and a projection.
 *   - `schemaVersion` bumps whenever `payload` shape changes for a given type.
 *   - `payload` contains no secrets. Redaction happens *before* persistence,
 *     not after.
 *   - `previousEventId` chains events per aggregate for tamper-evident audit.
 */

const EventBase = z.object({
  id: EventId,
  orgId: OrgId,
  occurredAt: IsoDateTime,
  schemaVersion: z.literal(1),
  previousEventId: EventId.optional(),
  actor: z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('user'), userId: UserId }),
    z.object({ kind: z.literal('agent'), agentRunId: AgentRunId }),
    z.object({ kind: z.literal('system'), component: z.string() }),
  ]),
});

const missionEvent = <T extends z.ZodTypeAny>(
  type: string,
  payload: T,
) =>
  EventBase.extend({
    type: z.literal(type),
    missionId: MissionId,
    payload,
  });

const taskEvent = <T extends z.ZodTypeAny>(type: string, payload: T) =>
  EventBase.extend({
    type: z.literal(type),
    missionId: MissionId,
    taskId: TaskId,
    payload,
  });

// ---------- mission.* ----------
export const MissionCreated = missionEvent(
  'mission.created',
  z.object({ intent: z.string() }),
);
export const MissionPlanned = missionEvent(
  'mission.planned',
  z.object({ taskCount: z.number().int().nonnegative() }),
);
export const MissionStarted = missionEvent('mission.started', z.object({}));
export const MissionPaused = missionEvent(
  'mission.paused',
  z.object({ reason: z.string() }),
);
export const MissionResumed = missionEvent('mission.resumed', z.object({}));
export const MissionCompleted = missionEvent('mission.completed', z.object({}));
export const MissionFailed = missionEvent(
  'mission.failed',
  z.object({ reason: z.string() }),
);
export const MissionCancelled = missionEvent(
  'mission.cancelled',
  z.object({ reason: z.string() }),
);
export const MissionVerified = missionEvent(
  'mission.verified',
  z.object({ p99ReportId: P99ReportId, confidence: z.number().min(0).max(1) }),
);

// ---------- task.* ----------
export const TaskCreated = taskEvent(
  'task.created',
  z.object({ title: z.string() }),
);
export const TaskReady = taskEvent('task.ready', z.object({}));
export const TaskStarted = taskEvent(
  'task.started',
  z.object({ agentRunId: AgentRunId }),
);
export const TaskWaitingApproval = taskEvent(
  'task.waiting_approval',
  z.object({ approvalId: ApprovalId }),
);
export const TaskRetrying = taskEvent(
  'task.retrying',
  z.object({ attempt: z.number().int().positive(), reason: z.string() }),
);
export const TaskCompleted = taskEvent('task.completed', z.object({}));
export const TaskFailed = taskEvent(
  'task.failed',
  z.object({ reason: z.string() }),
);
export const TaskCancelled = taskEvent(
  'task.cancelled',
  z.object({ reason: z.string() }),
);

// ---------- tool.* ----------
export const ToolRequested = EventBase.extend({
  type: z.literal('tool.requested'),
  missionId: MissionId,
  taskId: TaskId.optional(),
  toolRunId: ToolRunId,
  payload: z.object({ toolId: z.string(), inputHash: z.string() }),
});
export const ToolApproved = EventBase.extend({
  type: z.literal('tool.approved'),
  toolRunId: ToolRunId,
  payload: z.object({ approvalId: ApprovalId }),
});
export const ToolDenied = EventBase.extend({
  type: z.literal('tool.denied'),
  toolRunId: ToolRunId,
  payload: z.object({ reason: z.string() }),
});
export const ToolExecuted = EventBase.extend({
  type: z.literal('tool.executed'),
  toolRunId: ToolRunId,
  payload: z.object({
    durationMs: z.number().int().nonnegative(),
    outputHash: z.string(),
  }),
});
export const ToolFailed = EventBase.extend({
  type: z.literal('tool.failed'),
  toolRunId: ToolRunId,
  payload: z.object({
    durationMs: z.number().int().nonnegative(),
    reason: z.string(),
  }),
});

// ---------- model.* ----------
export const ModelCallStarted = EventBase.extend({
  type: z.literal('model.call_started'),
  modelRunId: ModelRunId,
  payload: z.object({
    providerId: z.string(),
    modelId: z.string(),
    /** From the mission; the router asserts every call respects this. */
    privacyClass: z.enum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'SECRET']),
  }),
});
export const ModelCallCompleted = EventBase.extend({
  type: z.literal('model.call_completed'),
  modelRunId: ModelRunId,
  payload: z.object({
    promptTokens: z.number().int().nonnegative(),
    completionTokens: z.number().int().nonnegative(),
    latencyMs: z.number().int().nonnegative(),
    costMicrocents: z.bigint().nonnegative(),
  }),
});
export const ModelCallFailed = EventBase.extend({
  type: z.literal('model.call_failed'),
  modelRunId: ModelRunId,
  payload: z.object({ reason: z.string(), latencyMs: z.number().int().nonnegative() }),
});

// ---------- sandbox.* ----------
export const SandboxCreated = EventBase.extend({
  type: z.literal('sandbox.created'),
  sandboxId: SandboxId,
  payload: z.object({ isolation: z.string() }),
});
export const SandboxDestroyed = EventBase.extend({
  type: z.literal('sandbox.destroyed'),
  sandboxId: SandboxId,
  payload: z.object({ durationMs: z.number().int().nonnegative() }),
});

// ---------- deployment.* ----------
export const DeploymentStarted = EventBase.extend({
  type: z.literal('deployment.started'),
  deploymentId: DeploymentId,
  payload: z.object({ adapter: z.string(), target: z.string() }),
});
export const DeploymentPromoted = EventBase.extend({
  type: z.literal('deployment.promoted'),
  deploymentId: DeploymentId,
  payload: z.object({}),
});
export const DeploymentRolledBack = EventBase.extend({
  type: z.literal('deployment.rolled_back'),
  deploymentId: DeploymentId,
  payload: z.object({ reason: z.string() }),
});
export const DeploymentFailed = EventBase.extend({
  type: z.literal('deployment.failed'),
  deploymentId: DeploymentId,
  payload: z.object({ reason: z.string() }),
});

// ---------- p99.* ----------
export const P99GateStarted = EventBase.extend({
  type: z.literal('p99.gate_started'),
  missionId: MissionId,
  payload: z.object({ gate: z.string() }),
});
export const P99GatePassed = EventBase.extend({
  type: z.literal('p99.gate_passed'),
  missionId: MissionId,
  payload: z.object({ gate: z.string(), evidenceArtifactId: z.string() }),
});
export const P99GateFailed = EventBase.extend({
  type: z.literal('p99.gate_failed'),
  missionId: MissionId,
  payload: z.object({ gate: z.string(), reason: z.string() }),
});
export const P99ReportGenerated = EventBase.extend({
  type: z.literal('p99.report_generated'),
  missionId: MissionId,
  payload: z.object({
    reportId: P99ReportId,
    confidence: z.number().min(0).max(1),
    verified: z.boolean(),
  }),
});

// ---------- approval.* ----------
export const ApprovalRequested = EventBase.extend({
  type: z.literal('approval.requested'),
  payload: z.object({
    approvalId: ApprovalId,
    reason: z.string(),
    riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  }),
});
export const ApprovalGranted = EventBase.extend({
  type: z.literal('approval.granted'),
  payload: z.object({ approvalId: ApprovalId, grantedBy: UserId }),
});
export const ApprovalDenied = EventBase.extend({
  type: z.literal('approval.denied'),
  payload: z.object({ approvalId: ApprovalId, deniedBy: UserId }),
});
export const ApprovalExpired = EventBase.extend({
  type: z.literal('approval.expired'),
  payload: z.object({ approvalId: ApprovalId }),
});

// ============================================================
// Mission runtime (Phase 2A) — minimal vocabulary
// ============================================================
// Enough for the state-transition kernel (P2A-010) to append its
// transitions. Broader vocabulary + chain-integrity coverage stays P2A-011.
// See ADR-0007 for the state graphs these events must correspond to.

const missionRunEvent = <T extends z.ZodTypeAny>(type: string, payload: T) =>
  EventBase.extend({
    type: z.literal(type),
    missionRunId: MissionRunId,
    missionId: MissionId,
    payload,
  });

const taskRunEvent = <T extends z.ZodTypeAny>(type: string, payload: T) =>
  EventBase.extend({
    type: z.literal(type),
    taskRunId: TaskRunId,
    missionRunId: MissionRunId,
    taskId: TaskId,
    payload,
  });

const taskAttemptEvent = <T extends z.ZodTypeAny>(type: string, payload: T) =>
  EventBase.extend({
    type: z.literal(type),
    taskAttemptId: TaskAttemptId,
    taskRunId: TaskRunId,
    payload,
  });

const taskLeaseEvent = <T extends z.ZodTypeAny>(type: string, payload: T) =>
  EventBase.extend({
    type: z.literal(type),
    taskLeaseId: TaskLeaseId,
    taskRunId: TaskRunId,
    payload,
  });

// ---------- mission_run.* ----------
export const MissionRunCreated = missionRunEvent(
  'mission_run.created',
  z.object({ runNumber: z.number().int().positive() }),
);
export const MissionRunQueued = missionRunEvent('mission_run.queued', z.object({}));
export const MissionRunStarted = missionRunEvent('mission_run.started', z.object({}));
export const MissionRunWaiting = missionRunEvent(
  'mission_run.waiting',
  z.object({ reason: z.string() }),
);
export const MissionRunCompleted = missionRunEvent('mission_run.completed', z.object({}));
export const MissionRunFailed = missionRunEvent(
  'mission_run.failed',
  z.object({ reason: z.string() }),
);
export const MissionRunCancelled = missionRunEvent(
  'mission_run.cancelled',
  z.object({ reason: z.string() }),
);

// ---------- task_run.* ----------
// State transitions on task_runs. Emitted from transitionTaskRun() inside
// the CAS'd transaction (ADR-0007 §Execution guarantees).
export const TaskRunCreated = taskRunEvent('task_run.created', z.object({}));
export const TaskRunBlocked = taskRunEvent(
  'task_run.blocked',
  z.object({ blockingTaskRunIds: z.array(TaskRunId) }),
);
export const TaskRunReady = taskRunEvent('task_run.ready', z.object({}));
export const TaskRunLeased = taskRunEvent(
  'task_run.leased',
  z.object({ taskLeaseId: TaskLeaseId, taskAttemptId: TaskAttemptId }),
);
export const TaskRunRunning = taskRunEvent(
  'task_run.running',
  z.object({ taskAttemptId: TaskAttemptId }),
);
export const TaskRunRetryWait = taskRunEvent(
  'task_run.retry_wait',
  z.object({
    attempt: z.number().int().positive(),
    retryWaitUntil: IsoDateTime,
    reason: z.string(),
  }),
);
export const TaskRunSucceeded = taskRunEvent(
  'task_run.succeeded',
  z.object({ taskAttemptId: TaskAttemptId }),
);
export const TaskRunFailed = taskRunEvent(
  'task_run.failed',
  z.object({ taskAttemptId: TaskAttemptId, reason: z.string() }),
);
export const TaskRunCancelled = taskRunEvent(
  'task_run.cancelled',
  z.object({ reason: z.string() }),
);
export const TaskRunDeadLettered = taskRunEvent(
  'task_run.dead_lettered',
  z.object({ finalAttempt: z.number().int().positive(), reason: z.string() }),
);

// ---------- task_attempt.* ----------
export const TaskAttemptStarted = taskAttemptEvent(
  'task_attempt.started',
  z.object({ workerId: z.string(), attemptNumber: z.number().int().positive() }),
);
export const TaskAttemptSucceeded = taskAttemptEvent(
  'task_attempt.succeeded',
  z.object({ resultId: z.string() }),
);
export const TaskAttemptFailed = taskAttemptEvent(
  'task_attempt.failed',
  z.object({ reason: z.string() }),
);
export const TaskAttemptCrashed = taskAttemptEvent(
  'task_attempt.crashed',
  z.object({ detectedBy: z.enum(['reclaimer', 'worker_self_report']) }),
);
export const TaskAttemptLeaseLost = taskAttemptEvent(
  'task_attempt.lease_lost',
  z.object({}),
);
export const TaskAttemptCancelled = taskAttemptEvent(
  'task_attempt.cancelled',
  z.object({ reason: z.string() }),
);

// ---------- task_lease.* ----------
export const TaskLeaseAcquired = taskLeaseEvent(
  'task_lease.acquired',
  z.object({
    workerId: z.string(),
    taskAttemptId: TaskAttemptId,
    expiresAt: IsoDateTime,
  }),
);
export const TaskLeaseHeartbeat = taskLeaseEvent(
  'task_lease.heartbeat',
  z.object({ workerId: z.string(), expiresAt: IsoDateTime }),
);
export const TaskLeaseExpired = taskLeaseEvent(
  'task_lease.expired',
  z.object({ reclaimedBy: z.string().optional() }),
);
export const TaskLeaseReleased = taskLeaseEvent(
  'task_lease.released',
  z.object({ workerId: z.string() }),
);

// ---------- discriminated union ----------
export const DomainEvent = z.discriminatedUnion('type', [
  MissionCreated,
  MissionPlanned,
  MissionStarted,
  MissionPaused,
  MissionResumed,
  MissionCompleted,
  MissionFailed,
  MissionCancelled,
  MissionVerified,
  TaskCreated,
  TaskReady,
  TaskStarted,
  TaskWaitingApproval,
  TaskRetrying,
  TaskCompleted,
  TaskFailed,
  TaskCancelled,
  ToolRequested,
  ToolApproved,
  ToolDenied,
  ToolExecuted,
  ToolFailed,
  ModelCallStarted,
  ModelCallCompleted,
  ModelCallFailed,
  SandboxCreated,
  SandboxDestroyed,
  DeploymentStarted,
  DeploymentPromoted,
  DeploymentRolledBack,
  DeploymentFailed,
  P99GateStarted,
  P99GatePassed,
  P99GateFailed,
  P99ReportGenerated,
  ApprovalRequested,
  ApprovalGranted,
  ApprovalDenied,
  ApprovalExpired,
  // Mission runtime (Phase 2A)
  MissionRunCreated,
  MissionRunQueued,
  MissionRunStarted,
  MissionRunWaiting,
  MissionRunCompleted,
  MissionRunFailed,
  MissionRunCancelled,
  TaskRunCreated,
  TaskRunBlocked,
  TaskRunReady,
  TaskRunLeased,
  TaskRunRunning,
  TaskRunRetryWait,
  TaskRunSucceeded,
  TaskRunFailed,
  TaskRunCancelled,
  TaskRunDeadLettered,
  TaskAttemptStarted,
  TaskAttemptSucceeded,
  TaskAttemptFailed,
  TaskAttemptCrashed,
  TaskAttemptLeaseLost,
  TaskAttemptCancelled,
  TaskLeaseAcquired,
  TaskLeaseHeartbeat,
  TaskLeaseExpired,
  TaskLeaseReleased,
]);
export type DomainEvent = z.infer<typeof DomainEvent>;

export type DomainEventType = DomainEvent['type'];
