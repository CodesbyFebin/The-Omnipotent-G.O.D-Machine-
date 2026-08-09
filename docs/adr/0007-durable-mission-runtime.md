# ADR-0007: Durable Mission Runtime

**Status:** Accepted
**Date:** 2026-08-09
**Deciders:** Founding engineering
**Depends on:** [ADR-0004](0004-storage-postgres-pgvector.md), [ADR-0005](0005-mission-and-event-model.md), [ADR-0006](0006-orm-and-auth.md)

## Context

Phase 1 established the substrate: identity, tenant isolation via
row-level security, an append-only event log, and a real integration
suite (`v0.1.0-rc1`). Phase 2 attaches the first executable primitive on
top of that substrate — a mission runtime — before any autonomous
intelligence (GOD Brain, Router, Swarm, Claw) touches production.

The premise is deliberate: **prove durable mission state, DAG scheduling,
leases, retries, idempotency, cancellation, event history, and crash
recovery with deterministic executors first.** Once that kernel is
reliable, LLM-driven executors are just another kind of executor plugged
into the same runtime, and their failures cannot corrupt state that the
runtime itself is responsible for.

Everything below is a **frozen decision** for Phase 2A. Changing any of
these — the state vocabularies, the invariants, the execution guarantees
— requires a new ADR that supersedes this one, not an in-place edit.

---

## 1. Frozen state vocabularies

### Mission states

```
DRAFT       intent captured, no run started
QUEUED      a MissionRun has been created and is waiting for the scheduler
RUNNING     at least one task is READY/LEASED/RUNNING
WAITING     all runnable tasks blocked (waiting_approval, upstream failure, …)
COMPLETED   every task in a terminal SUCCEEDED state
FAILED      at least one required task is DEAD_LETTER or a mission-level failure
CANCELLED   the mission was cancelled by a user or policy before COMPLETED
```

### Task states

```
PENDING       task_run created, dependencies not yet resolved
BLOCKED       one or more upstream dependencies are not SUCCEEDED
READY         eligible for a worker to lease
LEASED        a worker holds an exclusive lease; not yet running
RUNNING       worker is actively executing
RETRY_WAIT    last attempt failed but retries remain; waiting on backoff
SUCCEEDED     final terminal success
FAILED        terminal failure but retries are still permitted at the mission level
CANCELLED     explicit cancellation
DEAD_LETTER   retry budget exhausted; requires operator action
```

Terminal states: `SUCCEEDED`, `CANCELLED`, `DEAD_LETTER`. `FAILED` is a
transient runtime state — the mission-level policy decides whether to
retry (moving back to `RETRY_WAIT` → `READY`) or promote to `DEAD_LETTER`.

## 2. Execution guarantees

- **At-least-once task delivery.** A task may be leased multiple times if
  a worker dies before completing. Executors must be idempotent (see §5).
- **Idempotent effects.** Any tool call that mutates state outside the
  runtime uses an idempotency key derived from
  `(mission_run_id, task_run_id, attempt_number, effect_scope)` and is
  recorded in the `idempotency_keys` table before the side effect.
- **Durable state in PostgreSQL.** All runtime state — mission runs,
  task runs, attempts, leases, results, evidence — lives in Postgres.
  No in-memory source of truth. Server restart resumes from tables.
- **Transactional state transition + event append.** Every state change
  writes the row update AND appends the corresponding `DomainEvent` to
  `audit_events` in the same transaction, via the `withAuthenticatedTx`
  + `appendEvent` pattern established in Phase 1.
- **Worker leases with expiry.** A worker acquires a lease with a fixed
  duration. If it fails to heartbeat within that window, the lease is
  reclaimable by any other worker.
- **Lease table is current-state, not history (Model A).** `task_leases`
  holds at most one row per task_run — enforced by
  `UNIQUE(task_run_id)`. A lease is inserted on acquisition, updated
  on heartbeat, and DELETEd on completion/failure/expiry. Historical
  lease information — who leased, when, for which attempt, how it
  ended — lives in `task_attempts` (immutable, one row per attempt).
  This keeps the scheduler's hot path indexable on a small table and
  keeps the audit trail on an already-immutable structure.
- **Worker ownership is never inferred from possessing a task ID.**
  A worker holding `task_run_id = X` proves nothing on its own. Claim
  authorization comes from four sources evaluated together:
    1. Tenant context (the worker's org membership, set as
       `app.current_org` in the tx).
    2. Task eligibility (worker_class matches; task_run status is
       `READY` or `RETRY_WAIT` with `retry_wait_until <= now()`).
    3. Successful database lease acquisition (the `UNIQUE(task_run_id)`
       insert into `task_leases` — a race lost here means another
       worker owns it).
    4. Policy (the worker's service-account membership + role, evaluated
       through the same RLS + `god_app` demotion the app uses).
  This becomes load-bearing once GOD Swarm and EdgeNodes exist —
  distributed workers must not be able to escalate by fabricating or
  guessing task IDs.
- **Heartbeat-based lease extension.** Running workers push
  `heartbeat_at` forward periodically. The extension only succeeds if
  the lease is still valid (defence against a partitioned worker
  believing it still holds a lease that a reclaimer has taken).
- **Expired lease reclamation.** The scheduler treats any lease whose
  `expires_at < now()` as reclaimable regardless of what the worker
  believes.
- **Bounded retries.** Each task has a per-mission `max_attempts`.
  Exhaustion sends the task_run to `DEAD_LETTER`.
- **Exponential backoff + jitter.** `retry_wait_until = now() + base *
  2^(attempt-1) + jitter`. Base and cap are per-task policy.
- **DLQ after retry exhaustion.** `DEAD_LETTER` is terminal until an
  operator explicitly requeues the task_run.
- **Explicit cancellation.** Cancellation is a state, not a signal.
  Cancelling a mission_run cancels every non-terminal task_run and
  marks any active leases as tombstoned so heartbeats fail loud.
- **Dependency-aware readiness.** A task_run moves from `BLOCKED` to
  `READY` only when every dependency is `SUCCEEDED`. If any dependency
  is `CANCELLED` or `DEAD_LETTER`, the dependent is `CANCELLED` too.
- **Crash/restart recovery.** On boot, workers scan for their own
  interrupted leases and either resume (if lease valid) or release
  (if lease expired) — no manual intervention required.

## 3. The invariant that everything else depends on

```
mission definition  !=  mission run
task definition     !=  task run  !=  task attempt
```

Concretely:

- `missions` — **definition.** Immutable intent, spec, budget. Created
  once when a user asks for something. Can spawn many runs.
- `mission_runs` — **execution.** One row per attempted execution of a
  mission definition. Carries the mission-level state machine
  (`DRAFT` → `QUEUED` → … → `COMPLETED`). A retry of an entire mission
  is a new `mission_run`.
- `tasks` — **definition.** A node in the DAG for a mission. Carries
  the acceptance contract for that node.
- `task_runs` — **per-mission-run instance of a task.** One row per
  (task, mission_run). Carries the task state machine.
- `task_attempts` — **per-execution attempt of a task_run.** Immutable
  once appended. Holds worker id, lease id, timing, error, result
  reference.
- `task_leases` — **currently-held exclusive lease per task_run.**
  Enforced by `UNIQUE (task_run_id)` — there is never more than one
  active lease per task_run.
- `task_results` — **immutable output of a specific attempt.** Written
  once, never updated.
- `evidence` — **artifacts and observations attached to an attempt.**
  Files (via artifact ref), metrics, structured facts.
- `idempotency_keys` — **first-writer-wins deduplication of side
  effects** performed by executors.

One task with three attempts is a graph, not a mutable row:

```
Task (definition)
 └─ TaskRun (per mission_run)
     ├─ Attempt 1 → LEASE_LOST      (result: none, evidence: heartbeat gap)
     ├─ Attempt 2 → CRASHED          (result: partial, evidence: log tail)
     └─ Attempt 3 → SUCCEEDED
                    ├─ TaskResult
                    └─ Evidence[…]
```

Only `Attempt 3`'s result is the task's result. The others are
first-class rows for auditability and debugging.

## 4. Scheduling: PostgreSQL first, no Redis yet

The scheduler pattern:

```sql
BEGIN;
SET LOCAL app.current_user = '<worker-service-role>';
SELECT ...   -- set_config(app.current_org) is set by mission_run.org_id later

SELECT task_run.id
FROM task_runs
JOIN mission_runs ON mission_runs.id = task_runs.mission_run_id
WHERE task_runs.status = 'READY'
  AND task_runs.retry_wait_until IS NULL OR task_runs.retry_wait_until <= now()
  -- (worker capability filters here)
ORDER BY task_runs.priority DESC, task_runs.created_at ASC
LIMIT 1
FOR UPDATE SKIP LOCKED;

-- If a row is returned:
INSERT INTO task_leases (task_run_id, task_attempt_id, worker_id, ...)
VALUES (..., ..., $worker_id, now(), now() + interval '$lease_seconds', now());

UPDATE task_runs SET status = 'LEASED' WHERE id = $task_run_id;

INSERT INTO audit_events (...);  -- task.leased event

COMMIT;
```

Why Postgres first:

- Zero new infrastructure. Everything is already in Postgres.
- The semantics we need — atomic claim, exclusive lease, transactional
  transition + event append — are all native.
- `FOR UPDATE SKIP LOCKED` is well-understood at the scale Phase 2A
  targets (thousands of tasks/day, tens of concurrent workers).
- Replacing Postgres scheduling with Redis Streams or NATS JetStream
  later is a transport optimization behind the same mission model —
  the row schema and state vocabularies do not change.

We revisit this decision only when we have measured evidence that
Postgres scheduling is the bottleneck. **We do not add a queue system
speculatively.**

## 5. Idempotency

Every side effect a task executor performs against something outside
the runtime (writing a file, invoking a tool, calling an HTTP endpoint,
opening a PR) is guarded:

```
key = hash(mission_run_id + task_run_id + attempt_number + effect_scope)

INSERT INTO idempotency_keys (key, task_attempt_id, effect_scope, first_seen_at)
VALUES (...)
ON CONFLICT (key) DO NOTHING
RETURNING id;

-- If RETURNING is empty → the effect already ran. Do NOT re-execute; look
-- up the recorded result on the previous attempt and reuse it.
-- If RETURNING is non-empty → this is the first time; perform the effect.
```

Executors must:

- Not perform any side effect before writing the idempotency row.
- On retry, look up the previous idempotency row (same key) and reuse
  its stored result rather than re-invoking the effect.

The idempotency key **includes attempt_number by default** so retries
of an attempt that got stuck mid-side-effect can complete safely.
Executors that need cross-attempt idempotency (rare) must supply an
explicit `effect_scope` that excludes attempt_number.

## 6. The worker loop

Deterministically:

```
LOOP:
  claim = SELECT ... FOR UPDATE SKIP LOCKED  (§4)
  if none: sleep(idle_backoff); continue

  atomic:
    INSERT task_lease
    INSERT task_attempt (status=LEASED)
    UPDATE task_run (status=LEASED)
    appendEvent(task.leased)
  commit

  spawn heartbeat coroutine (every heartbeat_interval < lease_duration/3)

  try:
    UPDATE task_run (status=RUNNING); appendEvent(task.started)
    result = executor(task_run, prior_attempts_evidence)
    atomic:
      INSERT task_result (immutable)
      INSERT evidence[]
      UPDATE task_run (status=SUCCEEDED)
      DELETE task_lease WHERE task_run_id = ...
      UPDATE task_attempt (status=SUCCEEDED, ended_at=now())
      appendEvent(task.succeeded)
      -- resolve downstream: for each dependent task_run whose remaining deps are all SUCCEEDED:
      --    UPDATE task_run SET status='READY' WHERE ...
      --    appendEvent(task.ready)
      -- recompute mission_run.status
    commit
  catch executor_error:
    atomic:
      INSERT task_attempt_failure_row (or UPDATE attempt row)
      IF attempts_remaining:
        UPDATE task_run (status=RETRY_WAIT, retry_wait_until = ...)
        appendEvent(task.retrying)
      ELSE:
        UPDATE task_run (status=DEAD_LETTER)
        appendEvent(task.dead_lettered)
      DELETE task_lease
    commit
  finally:
    stop heartbeat
```

Reclamation runs as a periodic job (or per-poll pre-step):

```
BEGIN;
DELETE FROM task_leases
WHERE expires_at < now()
RETURNING task_run_id, task_attempt_id;
-- for each: UPDATE task_attempts SET status='LEASE_LOST', ended_at=now();
--           UPDATE task_runs SET status='READY';   (readiness recomputed if deps still hold)
--           appendEvent(task.lease_lost)
COMMIT;
```

## 7. P99 is an evidence consumer, not the worker's success flag

`task_run.status = SUCCEEDED` means the executor completed **according
to its contract**. It does not mean the mission is verified. P99
independently reads the mission_run's evidence graph and decides
whether the collected artifacts satisfy the mission's P99 policy
(build gate, unit tests, integration tests, security scans, coverage,
independent review, deployment health).

Concretely:

- Workers never write to `p99_reports` or set anything called
  `verified`.
- The P99 engine runs after `mission_run.status = COMPLETED` (or as
  a mission-level task in a follow-up ADR that keeps this separation).
- If P99 fails, the mission_run's terminal status is `COMPLETED` (the
  runtime did its job) but a distinct `p99_reports.verified = false`
  row exists — visible to the user as "completed but not verified".

This separation guarantees the runtime never grows a dependency on a
specific verification strategy. Verification stacks can evolve
independently of the mission kernel.

## 8. Rejected alternatives

- **Adding Redis/NATS/JetStream up front.** Rejected. Speculative
  infrastructure. Postgres solves Phase 2A's scale; a queue transport
  is a targeted swap later if evidence supports it.
- **Mutable single-row task state (no attempts).** Rejected. Makes
  retry, crash recovery, and debugging painful — and, more critically,
  destroys the audit chain because a retry silently overwrites the
  previous attempt's state.
- **In-memory scheduler with periodic DB checkpoint.** Rejected. Any
  crash between checkpoints loses work; violates the "no in-memory
  source of truth" guarantee.
- **Success flag == verification.** Rejected. Locks the runtime into
  one verification strategy and one moment in time. P99 as a separate
  consumer keeps both replaceable.
- **A separate queue-per-tenant.** Rejected. Fair queueing across
  tenants belongs in scheduler policy over one queue, not in
  operational surface area.
- **Historical `task_leases` (multiple rows per task_run).**
  Rejected. Would require a partial UNIQUE constraint or an
  application-layer "active lease" invariant, and duplicates
  information `task_attempts` already carries authoritatively. Model A
  (current-state only) is what §Execution guarantees commits to.

## 9. Open questions this ADR does not resolve

- Worker capability matching (a worker declaring "I can run tasks that
  need Docker sandbox and Node 20") — deferred to Phase 2B; the schema
  for this lives in `task_runs.worker_class` (Phase 2A ignores it).
- Fair scheduling across tenants under contention — deferred until
  workload evidence shows a policy is needed.
- Multi-region worker pools — deferred.
- Task priority classes — the `priority` column exists in `task_runs`
  from day one but only `NORMAL` is honored in Phase 2A.
- Streaming task output (long-running executors publishing progress
  events without terminating the attempt) — Phase 2B. The `evidence`
  table can carry incremental rows; the API surface for it is TBD.
