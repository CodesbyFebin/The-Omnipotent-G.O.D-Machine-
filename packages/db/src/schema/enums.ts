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
