import { pgEnum } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('org_role', [
  'OWNER',
  'ADMIN',
  'DEVELOPER',
  'OPERATOR',
  'REVIEWER',
  'VIEWER',
]);

export const autonomyLevelEnum = pgEnum('autonomy_level', [
  'ASK',
  'ASSIST',
  'EXECUTE',
  'AUTONOMOUS',
  'P99',
]);

export const privacyClassEnum = pgEnum('privacy_class', [
  'PUBLIC',
  'INTERNAL',
  'CONFIDENTIAL',
  'SECRET',
]);

export const riskLevelEnum = pgEnum('risk_level', [
  'LOW',
  'MEDIUM',
  'HIGH',
  'CRITICAL',
]);

export const missionStatusEnum = pgEnum('mission_status', [
  'draft',
  'planned',
  'running',
  'paused',
  'verifying',
  'verified',
  'failed',
  'cancelled',
]);

export const taskStatusEnum = pgEnum('task_status', [
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

// ---------- Phase 2A: mission runtime ----------
// Distinct from the legacy `mission_status` and `task_status` enums above,
// which describe DEFINITION-level state. Runtime state lives in the enums
// below and is enforced by migration 0004.

export const missionRunStatusEnum = pgEnum('mission_run_status', [
  'DRAFT',
  'QUEUED',
  'RUNNING',
  'WAITING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);

export const taskRunStatusEnum = pgEnum('task_run_status', [
  'PENDING',
  'BLOCKED',
  'READY',
  'LEASED',
  'RUNNING',
  'RETRY_WAIT',
  'SUCCEEDED',
  'FAILED',
  'CANCELLED',
  'DEAD_LETTER',
]);

export const taskAttemptStatusEnum = pgEnum('task_attempt_status', [
  'LEASED',
  'RUNNING',
  'SUCCEEDED',
  'FAILED',
  'CRASHED',
  'LEASE_LOST',
  'CANCELLED',
]);

export const taskPriorityEnum = pgEnum('task_priority', [
  'LOW',
  'NORMAL',
  'HIGH',
  'CRITICAL',
]);

export const evidenceKindEnum = pgEnum('evidence_kind', [
  'log',
  'metric',
  'artifact',
  'structured',
  'screenshot',
  'trace',
]);
