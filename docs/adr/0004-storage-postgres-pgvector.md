# ADR-0004: Storage — Postgres + pgvector as the primary database

**Status:** Accepted
**Date:** 2026-08-09
**Deciders:** Founding engineering

## Context

The platform needs relational data (users, orgs, projects, missions, tasks,
tool runs), append-only audit events, full-text search over code and docs,
and vector search over memory embeddings. We also need a queue for durable
worker jobs, and short-lived state for presence and stream coordination.

Options considered:

1. **Postgres for relational + pgvector for embeddings + Redis for
   queue/short-lived state + object storage for artifacts.**
2. **Split: Postgres relational, dedicated vector DB (Qdrant/Pinecone/Weaviate),
   Redis, object storage.**
3. **Everything in Postgres including the queue** (via `SKIP LOCKED` / `pg_boss`
   pattern) and no Redis for the initial deployment.

## Decision

**Option 1: Postgres + pgvector + Redis + object storage.**

- **Postgres** is the primary system of record. It carries users, orgs,
  memberships, projects, repositories, missions, tasks, task dependencies,
  agent runs, tool runs, model runs, providers, workers, worker runs,
  workflows, nodes, sandboxes, artifacts (metadata; blobs live in object
  storage), approvals, deployments, `p99_reports`, `audit_events`, memories
  (metadata + small text), knowledge documents, usage records, secrets
  (encrypted). Row-level security enabled on org-scoped tables.
- **pgvector** provides vector search inside the same Postgres instance,
  keeping embeddings adjacent to the entities they describe. No cross-system
  consistency problem to solve.
- **Postgres full-text search** for code and doc search, at least until scale
  or query pattern forces a switch.
- **Redis** for durable queues (Redis Streams with consumer groups), rate
  limits, distributed locks, session revocation lists, presence, per-worker
  heartbeats. **Not** for state that must survive a Redis wipe.
- **Object storage** (S3-compatible; local dev uses MinIO or the filesystem)
  for source archives, artifacts, logs, screenshots, reports, build outputs.

We commit to Postgres. We do **not** commit yet to a specific ORM or query
builder — that is a Phase 1 decision, deferred until we have the first
schema in hand.

## Consequences

- Single database engine to operate. Backups, HA, monitoring, upgrades all
  target one system.
- Cross-entity queries (e.g., "find mission tasks whose evidence artifacts
  reference this file") are joins, not distributed queries.
- Vector search is fast enough for our expected volumes at pgvector's current
  performance envelope. If we outgrow it, an out-of-band vector index is a
  local optimization behind the Context Engine's retrieval interface — the
  data model does not change.
- The queue in Redis Streams is durable and horizontally scalable but does
  require a Redis operator or managed service in production. A future ADR
  may revisit if Postgres-backed queues suffice.
- Object storage is mandatory. Attempting to store artifacts as Postgres
  bytea will not work at real usage.

## Consequences we accept explicitly

- Postgres upgrades will occasionally require pgvector version coordination.
  Documented in the ops runbook (Phase 11).
- We depend on Postgres row-level security as a defence-in-depth, not the
  sole authz mechanism. Application-layer org scoping remains mandatory.

## Rejected alternatives

- **Dedicated vector DB:** rejected for Phase 1. Adds a service without
  performance need, and introduces a two-source-of-truth problem for
  memory metadata.
- **Postgres-only (no Redis):** deferred. It's viable and simpler; we will
  revisit before Phase 9 (workers) when queue characteristics matter most.
  For now, Redis Streams is the default because the operational patterns are
  well-understood.

## Open questions this ADR does not resolve

- ORM / query builder choice (Prisma vs Drizzle vs Kysely vs raw + pgtyped).
  Decision by end of Phase 1 in a separate ADR.
- Whether the queue moves to Postgres before Phase 9.
- Sharding strategy for `audit_events` at scale (deferred to Phase 14).
