-- GOD Machine — Phase 2A: Durable Mission Runtime
-- See docs/adr/0007-durable-mission-runtime.md for the full design.
--
-- Adds seven tables that separate DEFINITION from EXECUTION:
--   mission_runs      — one row per attempted execution of a mission
--   task_runs         — one row per (task_definition, mission_run) instance
--   task_attempts     — immutable row per worker attempt at a task_run
--   task_leases       — currently-held exclusive lease per task_run (UNIQUE)
--   task_results      — immutable output of a specific attempt
--   evidence          — artifacts / metrics / logs attached to an attempt
--   idempotency_keys  — first-writer-wins dedupe of executor side effects
--
-- Every new org-scoped table gets RLS + FORCE + the same is_member_of /
-- has_org_role policies established in migration 0002.
--> statement-breakpoint

-- ---------- enums ----------
CREATE TYPE mission_run_status AS ENUM (
  'DRAFT','QUEUED','RUNNING','WAITING','COMPLETED','FAILED','CANCELLED'
);
--> statement-breakpoint

CREATE TYPE task_run_status AS ENUM (
  'PENDING','BLOCKED','READY','LEASED','RUNNING','RETRY_WAIT',
  'SUCCEEDED','FAILED','CANCELLED','DEAD_LETTER'
);
--> statement-breakpoint

CREATE TYPE task_attempt_status AS ENUM (
  'LEASED','RUNNING','SUCCEEDED','FAILED','CRASHED','LEASE_LOST','CANCELLED'
);
--> statement-breakpoint

CREATE TYPE task_priority AS ENUM ('LOW','NORMAL','HIGH','CRITICAL');
--> statement-breakpoint

CREATE TYPE evidence_kind AS ENUM (
  'log','metric','artifact','structured','screenshot','trace'
);
--> statement-breakpoint

-- ---------- mission_runs ----------
-- One row per execution of a mission (a mission may be retried at the
-- mission level, producing multiple runs). `run_number` is monotonic per
-- mission and unique.
CREATE TABLE mission_runs (
  id                   text PRIMARY KEY,
  org_id               text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  mission_id           text NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  run_number           integer NOT NULL,
  status               mission_run_status NOT NULL DEFAULT 'DRAFT',
  created_by           text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at           timestamptz NOT NULL DEFAULT now(),
  queued_at            timestamptz,
  started_at           timestamptz,
  completed_at         timestamptz,
  cancelled_at         timestamptz,
  cancellation_reason  text
);
--> statement-breakpoint
CREATE UNIQUE INDEX mission_runs_mission_run_number_idx
  ON mission_runs (mission_id, run_number);
--> statement-breakpoint
CREATE INDEX mission_runs_org_status_idx ON mission_runs (org_id, status);
--> statement-breakpoint
CREATE INDEX mission_runs_status_idx ON mission_runs (status);
--> statement-breakpoint

-- ---------- task_runs ----------
-- Per-mission-run instance of a task definition. Carries the task state
-- machine. Dependencies are resolved by joining against task_dependencies
-- (definition-level) filtered to task_runs of the same mission_run_id.
CREATE TABLE task_runs (
  id                    text PRIMARY KEY,
  org_id                text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  mission_run_id        text NOT NULL REFERENCES mission_runs(id) ON DELETE CASCADE,
  task_id               text NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  status                task_run_status NOT NULL DEFAULT 'PENDING',
  priority              task_priority NOT NULL DEFAULT 'NORMAL',
  attempt_count         integer NOT NULL DEFAULT 0,
  max_attempts          integer NOT NULL DEFAULT 3,
  -- Backoff parameters (milliseconds). Actual retry_wait_until is stored
  -- separately so the scheduler doesn't recompute the formula.
  backoff_base_ms       integer NOT NULL DEFAULT 1000,
  backoff_cap_ms        integer NOT NULL DEFAULT 300000,
  retry_wait_until      timestamptz,
  -- Optional class of worker required to execute this task_run. Phase 2A
  -- ignores this (any worker can claim any READY task_run); Phase 2B uses
  -- it to filter the scheduler's SELECT.
  worker_class          text,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),
  ready_at              timestamptz,
  first_leased_at       timestamptz,
  completed_at          timestamptz,
  UNIQUE (mission_run_id, task_id)
);
--> statement-breakpoint
CREATE INDEX task_runs_org_id_idx ON task_runs (org_id);
--> statement-breakpoint
CREATE INDEX task_runs_mission_run_idx ON task_runs (mission_run_id);
--> statement-breakpoint
-- The scheduler's hot path. Ordered by (status, priority DESC, ready_at ASC).
CREATE INDEX task_runs_scheduler_idx
  ON task_runs (status, priority DESC, ready_at ASC)
  WHERE status IN ('READY','RETRY_WAIT');
--> statement-breakpoint

-- ---------- task_attempts ----------
-- Immutable once inserted. One per (task_run, attempt_number).
CREATE TABLE task_attempts (
  id              text PRIMARY KEY,
  org_id          text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_run_id     text NOT NULL REFERENCES task_runs(id) ON DELETE CASCADE,
  attempt_number  integer NOT NULL,
  status          task_attempt_status NOT NULL DEFAULT 'LEASED',
  worker_id       text NOT NULL,
  worker_class    text,
  started_at      timestamptz NOT NULL DEFAULT now(),
  ended_at        timestamptz,
  error_message   text,
  error_details   jsonb,
  UNIQUE (task_run_id, attempt_number)
);
--> statement-breakpoint
CREATE INDEX task_attempts_org_id_idx ON task_attempts (org_id);
--> statement-breakpoint
CREATE INDEX task_attempts_worker_idx ON task_attempts (worker_id);
--> statement-breakpoint
CREATE INDEX task_attempts_status_idx ON task_attempts (status);
--> statement-breakpoint

-- ---------- task_leases ----------
-- Currently-held exclusive lease per task_run. The UNIQUE constraint on
-- task_run_id is what makes "at most one active lease per task_run" a DB
-- invariant instead of an application-layer hope.
CREATE TABLE task_leases (
  id                text PRIMARY KEY,
  org_id            text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_run_id       text NOT NULL REFERENCES task_runs(id) ON DELETE CASCADE UNIQUE,
  task_attempt_id   text NOT NULL REFERENCES task_attempts(id) ON DELETE CASCADE,
  worker_id         text NOT NULL,
  leased_at         timestamptz NOT NULL DEFAULT now(),
  heartbeat_at      timestamptz NOT NULL DEFAULT now(),
  expires_at        timestamptz NOT NULL,
  lease_generation  integer NOT NULL DEFAULT 1
);
--> statement-breakpoint
CREATE INDEX task_leases_expires_idx ON task_leases (expires_at);
--> statement-breakpoint
CREATE INDEX task_leases_worker_idx ON task_leases (worker_id);
--> statement-breakpoint

-- ---------- task_results ----------
-- Immutable output of a specific attempt. UNIQUE (task_attempt_id) enforces
-- "at most one result per attempt" and doubles as the idempotency guard
-- against double-write from a partitioned worker.
CREATE TABLE task_results (
  id                text PRIMARY KEY,
  org_id            text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_run_id       text NOT NULL REFERENCES task_runs(id) ON DELETE CASCADE,
  task_attempt_id   text NOT NULL REFERENCES task_attempts(id) ON DELETE CASCADE UNIQUE,
  output            jsonb NOT NULL,
  content_hash      text NOT NULL,
  written_at        timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX task_results_task_run_idx ON task_results (task_run_id);
--> statement-breakpoint

-- ---------- evidence ----------
-- Files/metrics/logs attached to an attempt. Multiple rows per attempt are
-- expected. P99 reads this table to decide verification.
CREATE TABLE evidence (
  id                text PRIMARY KEY,
  org_id            text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  mission_run_id    text NOT NULL REFERENCES mission_runs(id) ON DELETE CASCADE,
  task_run_id       text REFERENCES task_runs(id) ON DELETE CASCADE,
  task_attempt_id   text REFERENCES task_attempts(id) ON DELETE CASCADE,
  kind              evidence_kind NOT NULL,
  label             text NOT NULL,
  -- For 'artifact': `artifact_uri` points at object storage; `content` may
  -- be null. For 'log'/'metric'/'structured'/'trace': `content` carries
  -- the payload; `artifact_uri` may be null.
  artifact_uri      text,
  content           jsonb,
  bytes             bigint,
  content_hash      text,
  created_at        timestamptz NOT NULL DEFAULT now()
);
--> statement-breakpoint
CREATE INDEX evidence_mission_run_idx ON evidence (mission_run_id);
--> statement-breakpoint
CREATE INDEX evidence_task_run_idx ON evidence (task_run_id);
--> statement-breakpoint
CREATE INDEX evidence_task_attempt_idx ON evidence (task_attempt_id);
--> statement-breakpoint
CREATE INDEX evidence_kind_idx ON evidence (kind);
--> statement-breakpoint

-- ---------- idempotency_keys ----------
-- First-writer-wins dedupe of executor side effects. `key` is the hash
-- computed as SHA-256(mission_run_id + ':' + task_run_id + ':' +
-- attempt_number + ':' + effect_scope). Retries of the same attempt
-- see the existing row and reuse its recorded_result_id instead of
-- re-invoking the effect.
CREATE TABLE idempotency_keys (
  key                 text PRIMARY KEY,
  org_id              text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  task_attempt_id     text NOT NULL REFERENCES task_attempts(id) ON DELETE CASCADE,
  effect_scope        text NOT NULL,
  recorded_result     jsonb,
  first_seen_at       timestamptz NOT NULL DEFAULT now(),
  completed_at        timestamptz
);
--> statement-breakpoint
CREATE INDEX idempotency_keys_org_id_idx ON idempotency_keys (org_id);
--> statement-breakpoint
CREATE INDEX idempotency_keys_attempt_idx ON idempotency_keys (task_attempt_id);
--> statement-breakpoint

-- ---------- RLS + FORCE + policies ----------
-- Same pattern as migration 0002. Every new table:
--   * ENABLE + FORCE row level security
--   * SELECT: any org member
--   * INSERT/UPDATE: OWNER/ADMIN/DEVELOPER/OPERATOR
--   * DELETE: OWNER/ADMIN
-- results, evidence, idempotency_keys are append-only from executors' PoV;
-- DELETE is admin-only.
-- task_leases INSERT/UPDATE/DELETE are OPERATOR+ (workers act as operators
-- for their org via a service-account membership).

ALTER TABLE mission_runs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE mission_runs FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY mission_runs_member_select ON mission_runs
  FOR SELECT USING (is_member_of(org_id));
--> statement-breakpoint
CREATE POLICY mission_runs_dev_insert ON mission_runs
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
CREATE POLICY mission_runs_dev_update ON mission_runs
  FOR UPDATE USING (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'))
  WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
CREATE POLICY mission_runs_admin_delete ON mission_runs
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

ALTER TABLE task_runs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE task_runs FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY task_runs_member_select ON task_runs
  FOR SELECT USING (is_member_of(org_id));
--> statement-breakpoint
CREATE POLICY task_runs_dev_insert ON task_runs
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
CREATE POLICY task_runs_dev_update ON task_runs
  FOR UPDATE USING (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'))
  WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
CREATE POLICY task_runs_admin_delete ON task_runs
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

ALTER TABLE task_attempts ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE task_attempts FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY task_attempts_member_select ON task_attempts
  FOR SELECT USING (is_member_of(org_id));
--> statement-breakpoint
CREATE POLICY task_attempts_op_insert ON task_attempts
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
CREATE POLICY task_attempts_op_update ON task_attempts
  FOR UPDATE USING (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'))
  WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
CREATE POLICY task_attempts_admin_delete ON task_attempts
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

ALTER TABLE task_leases ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE task_leases FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY task_leases_member_select ON task_leases
  FOR SELECT USING (is_member_of(org_id));
--> statement-breakpoint
CREATE POLICY task_leases_op_insert ON task_leases
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
CREATE POLICY task_leases_op_update ON task_leases
  FOR UPDATE USING (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'))
  WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
CREATE POLICY task_leases_op_delete ON task_leases
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint

ALTER TABLE task_results ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE task_results FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY task_results_member_select ON task_results
  FOR SELECT USING (is_member_of(org_id));
--> statement-breakpoint
CREATE POLICY task_results_op_insert ON task_results
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
CREATE POLICY task_results_no_update ON task_results
  FOR UPDATE USING (false);
--> statement-breakpoint
CREATE POLICY task_results_admin_delete ON task_results
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE evidence FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY evidence_member_select ON evidence
  FOR SELECT USING (is_member_of(org_id));
--> statement-breakpoint
CREATE POLICY evidence_op_insert ON evidence
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
CREATE POLICY evidence_no_update ON evidence
  FOR UPDATE USING (false);
--> statement-breakpoint
CREATE POLICY evidence_admin_delete ON evidence
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

ALTER TABLE idempotency_keys ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE idempotency_keys FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY idempotency_keys_member_select ON idempotency_keys
  FOR SELECT USING (is_member_of(org_id));
--> statement-breakpoint
CREATE POLICY idempotency_keys_op_insert ON idempotency_keys
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
-- The recorded_result may be filled in after the first insert (the effect
-- completes, we write the result). Update allowed for the same role class.
CREATE POLICY idempotency_keys_op_update ON idempotency_keys
  FOR UPDATE USING (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'))
  WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint
CREATE POLICY idempotency_keys_admin_delete ON idempotency_keys
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

-- ---------- grants for the god_app role (migration 0002 added the role) ----------
GRANT SELECT, INSERT, UPDATE, DELETE ON
  mission_runs, task_runs, task_attempts, task_leases,
  task_results, evidence, idempotency_keys
TO god_app;
