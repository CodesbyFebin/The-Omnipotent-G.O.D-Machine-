-- GOD Machine — Pre-P2A-010: aggregate-scoped audit chain
--
-- Rationale (see ADR-0007 §Execution guarantees):
--   Runtime rows (mission_runs, task_runs, task_attempts, task_leases) each
--   need an independent event chain. The Phase 1 audit_events schema chained
--   only by (org_id, mission_id, task_id) — which would silently merge two
--   mission_runs of the same mission definition into one chain, corrupting
--   per-run audit.
--
-- Fix: introduce (aggregate_kind, aggregate_id) as the canonical chain scope.
-- Keep mission_id and task_id as denormalized filter columns for existing
-- read paths.
--
-- Aggregate kinds the runtime writes:
--   'mission', 'task'                               (definitions)
--   'mission_run', 'task_run', 'task_attempt', 'task_lease'  (executions)
--   'tool_run', 'model_run', 'sandbox', 'deployment', 'approval', 'p99'
--
-- Backfill maps existing rows onto the new scope via the previous scoping
-- rule so audit continuity is preserved across migration.
--> statement-breakpoint

ALTER TABLE audit_events
  ADD COLUMN aggregate_kind text,
  ADD COLUMN aggregate_id text;
--> statement-breakpoint

-- Backfill any existing rows using the legacy Phase 1 scoping (task > mission > org).
UPDATE audit_events
   SET aggregate_kind = CASE
         WHEN task_id IS NOT NULL THEN 'task'
         WHEN mission_id IS NOT NULL THEN 'mission'
         ELSE 'org'
       END,
       aggregate_id = COALESCE(task_id, mission_id, org_id)
 WHERE aggregate_kind IS NULL OR aggregate_id IS NULL;
--> statement-breakpoint

ALTER TABLE audit_events
  ALTER COLUMN aggregate_kind SET NOT NULL,
  ALTER COLUMN aggregate_id SET NOT NULL;
--> statement-breakpoint

-- Hot path index for appendEvent's previous-event lookup.
-- (org_id, aggregate_kind, aggregate_id) is the chain scope; occurred_at
-- DESC narrows to the last event.
CREATE INDEX audit_events_aggregate_chain_idx
  ON audit_events (org_id, aggregate_kind, aggregate_id, occurred_at DESC);
--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE, DELETE ON audit_events TO god_app;
