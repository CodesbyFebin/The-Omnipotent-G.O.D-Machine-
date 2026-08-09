# ADR-0005: Mission state machine and typed domain events

**Status:** Accepted
**Date:** 2026-08-09
**Deciders:** Founding engineering

## Context

The GOD Machine execution chain is long and largely asynchronous. Missions
can run for hours, span multiple agents, wait on human approvals, and survive
server restarts. State that lives only in a running process, or only in a
model's prompt history, is not recoverable and not auditable.

Additionally, every meaningful state change (mission created, task ready,
tool executed, deployment promoted, gate passed) must be visible to
observability, to the UI, to the audit log, and to workers that react to
events.

Options considered:

1. **In-process orchestration only**, persisted lazily.
2. **Persist mission and task state, but represent transitions as ad-hoc
   updates.**
3. **Persisted state machine + typed domain events as the single source of
   truth for transitions.**

## Decision

**Option 3.** Mission and task state live in Postgres. Every state transition
is expressed as a typed `DomainEvent`, appended to `audit_events`. The current
state of a mission/task is the projection of its events onto the mission/task
row; the row exists so queries are cheap, but the event log is authoritative.

Task states:

```
pending → blocked → ready → running → completed
                             ↓
                          waiting_approval → running
                             ↓
                          retrying → running | failed
                             ↓
                          cancelled
```

Mission states:

```
draft → planned → running → verifying → verified
                     ↓
                  paused → running
                     ↓
                  failed | cancelled
```

Event categories (non-exhaustive — see `packages/schemas/src/events.ts`):

- `mission.*` — created, planned, started, paused, resumed, completed, failed, cancelled, verified.
- `task.*` — created, ready, started, waiting_approval, retrying, completed, failed, cancelled.
- `agent.*` — spawned, completed, failed.
- `tool.*` — requested, approved, denied, executed, failed.
- `model.*` — call_started, call_completed, call_failed.
- `sandbox.*` — created, destroyed.
- `deployment.*` — started, promoted, rolled_back, failed.
- `p99.*` — gate_started, gate_passed, gate_failed, report_generated, mission_verified, mission_rejected.
- `approval.*` — requested, granted, denied, expired.
- `audit.*` — read, export, admin_action.

Every event has: `id`, `occurred_at`, `actor`, `subject`, `mission_id`,
`org_id`, `type`, `payload` (typed per event), `previous_event_id`,
`schema_version`.

## Consequences

- Server restart does not lose mission state. On startup, workers scan for
  missions in non-terminal states and resume from the last event.
- The UI subscribes to the event stream and updates in real time. The
  websocket layer is thin.
- Debugging a mission means reading its event log. There is no other
  ambient state to check.
- Audit is not a bolt-on: it is the same append-only table that drives
  execution. This is defence against "audit gap" incidents.
- Event schemas are versioned. A schema change requires a new
  `schema_version` and a projection update.
- Persisting events is on the write path of every transition, so events must
  be cheap. Payloads reference artifact IDs, not artifact contents.
- Model outputs are **not** the source of truth for mission state. A model
  saying "task complete" does not complete the task; only a validated tool
  result or a verifier's `task.completed` event does.

## Consequences we accept explicitly

- Write amplification: every transition writes an event and updates the row.
  Acceptable at expected mission volumes; sharding plan deferred to Phase 14.
- Backward compatibility: renaming an event type is a schema-version bump
  plus a projection.

## Rejected alternatives

- **In-process orchestration only:** rejected. Server restart = data loss;
  audit = fragmented logs.
- **State updates without events:** rejected. Loses the audit trail and the
  event stream that workers and UI need.

## Open questions this ADR does not resolve

- The event bus: initially "Postgres LISTEN/NOTIFY + polling" for simplicity;
  a proper broker (NATS JetStream or Redis Streams) may replace it before
  Phase 9. Whichever is chosen, the event schemas do not change.
- Retention of `audit_events`. Compliance retention is org-configurable; the
  default is deferred to Phase 12.
