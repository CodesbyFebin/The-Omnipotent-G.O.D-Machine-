# Changelog

All notable changes to this project are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project uses
semantic versioning once it reaches `0.1.0`.

## [Unreleased]

### Phase 2A opened — durable mission runtime foundations

Not a release. Preparatory work for the runtime kernel that ADR-0007
freezes:

- **ADR-0007** — durable mission runtime. Freezes the mission and task
  state vocabularies, the at-least-once + idempotent-effects contract,
  Postgres-first scheduling via `FOR UPDATE SKIP LOCKED`, the
  definition-vs-run invariant, and the separation between
  `task_run.status = SUCCEEDED` (executor honored its contract) and
  P99 verification (evidence consumer, decides whether the mission
  is verified).
- **Migration `0004_mission_runtime.sql`** — seven new tables:
  `mission_runs`, `task_runs`, `task_attempts`, `task_leases`,
  `task_results`, `evidence`, `idempotency_keys`. Every table under
  RLS + FORCE with the same `is_member_of`/`has_org_role` policies as
  Phase 1; grants extended to the `god_app` role. `UNIQUE (task_run_id)`
  on `task_leases` makes "at most one active lease per task_run" a
  database invariant, not an application-layer hope. `UNIQUE (task_attempt_id)`
  on `task_results` and on `idempotency_keys.key` guard against duplicate
  writes from partitioned workers.
- **Drizzle schema `packages/db/src/schema/runtime.ts`** matching the
  migration, plus new prefixed-ULID constructors (`mrn_`, `trn_`,
  `att_`, `lse_`, `res_`, `evd_`).
- **BUILD-TRACKER** — new **Phase 2A** section with 14 implementation
  rows and a **20-scenario CI gate** (lease exclusivity, lease expiry,
  worker crash + reclaim, idempotent duplicate delivery, retry
  exhaustion → DEAD_LETTER, cross-org denial for mission_runs, process
  restart recovery, and the kill-worker acceptance test).

Local verification:
- All three migrations apply cleanly on an empty Postgres (17 tables).
- Full workspace typecheck green.
- Phase 1 integration suite (19 tests) still passes with migration 0004
  applied — RLS on the new tables composes with existing policies.

**Not yet built and honestly listed as TODO in the tracker:** the
runtime code itself (projector, DAG resolver, scheduler, worker loop,
reclaimer, retry policy, cancellation, idempotency broker), the runtime
domain events, the mission APIs, the mission-run dashboard, the
deterministic test-executor package, and the 20 CI scenarios. Those
are the actual Phase 2A work — they'll land as `P2A-003` through
`P2A-014` and `P2A-CI-01` through `P2A-CI-20`.

### v0.1.0-rc1 — Phase 1 minus OAuth

CI green on `a89c0d3` across all three jobs (node typecheck+build,
integration Postgres+RLS+auth, docs).

**Added:**

- **ADR-0006** (Drizzle + argon2id + DB sessions).
- **`packages/db`** — Drizzle schema for users/sessions/orgs/memberships/
  projects/repositories/missions/tasks/task_dependencies/audit_events.
  Migration `0001_initial.sql` and `0002_row_level_security.sql`.
  `withAuthenticatedTx`, `withUserTx`, `withBootstrapTx` transaction helpers
  that set Postgres session variables via `set_config()` and demote to a
  non-superuser `god_app` role so RLS actually enforces.
- **`packages/auth`** — argon2id (const-enum-workaround for isolatedModules),
  256-bit opaque sessions stored SHA-256-hashed, `__Host-` cookie helpers.
- **`packages/events`** — `appendEvent(tx, event)` chains `previousEventId`
  per aggregate inside the caller's transaction.
- **P1-007** — `apps/web/lib/authz.ts` guards: `requireUser`,
  `requireOrgMembership`, `requireOrgRole`, `requireProjectAccess`,
  `requireMissionAccess` (plus route-handler variants). 404-not-403 on
  forbidden to avoid existence leak.
- **P1-008** — RLS policies on every org-scoped table with `FORCE ROW LEVEL
  SECURITY`. Non-superuser `god_app` role created idempotently. Helper
  functions (`is_member_of`, `has_org_role`) are `SECURITY DEFINER` to
  avoid RLS recursion. `audit_events` UPDATE/DELETE denied (append-only).
- **P1-009** — real integration CI. GH Actions Postgres 16 + pgvector
  service. Fresh-DB migration, re-migrate no-op check, wipe-and-remigrate
  destroy/recreate coverage, then `@god/integration-tests` runs:
    * `rls.test.ts` (11 tests): cross-org denial for SELECT/INSERT/UPDATE,
      positive access, viewer-vs-owner visibility, `withUserTx` cross-org
      listing, user self-visibility, audit_events append-only enforcement.
    * `auth.test.ts` (6 tests): password hash+verify, short-password
      rejection, session round-trip via bootstrap tx, revoke,
      hashed-not-raw storage.
    * `events.test.ts` (2 tests): `previousEventId` chaining and Zod
      rejection of malformed events.

**Bug fixes discovered along the way:**

- Drizzle migrator silently drops multi-statement migrations without
  `--> statement-breakpoint` markers. Both migrations updated.
- `SET LOCAL name = $1` is not valid Postgres. Switched to `set_config(name,
  value, true)`.
- FORCE ROW LEVEL SECURITY does not apply to superusers. Added `god_app`
  demotion via `SET LOCAL ROLE`.
- `is_member_of()`/`has_org_role()` under RLS caused infinite recursion.
  Both are now `SECURITY DEFINER` with pinned search_path.
- CI YAML: step names with `:` must be quoted (broke the first Phase 1 CI
  run with an empty jobs list).
- `next build` cannot resolve `.js` extensions on TS files and does not
  reach `serverExternalPackages` through transpiled workspace packages.
  Fixed by stripping `.js` extensions from relative imports and adding a
  webpack externals hook for `@node-rs/argon2` + `postgres`.

**Deferred to `v0.1.0-foundation`:**

- P1-001b — OAuth providers. Ships next; will plug into the same
  `users + sessions` tables (see ADR-0006 §Auth).

### Added — Phase 1 (in progress)

- **ADR-0006:** Drizzle ORM + argon2id + DB-backed opaque sessions.
- **`packages/db`:** Drizzle schema for users, sessions, orgs, memberships,
  projects, repositories, missions, tasks, task_dependencies, audit_events.
  Migration `0001_initial.sql` (hand-written; CI-runnable). Postgres session
  variables `app.current_user` / `app.current_org` set by
  `withAuthenticatedTx()` for RLS-ready code paths. Prefixed-ULID ID generator.
- **`packages/auth`:** argon2id hash/verify, opaque 256-bit session tokens
  hashed with SHA-256 before storage, sliding `last_seen_at`, `__Host-`-prefixed
  session cookie with `HttpOnly` + `SameSite=Lax`.
- **`packages/events`:** `appendEvent(tx, event)` that runs inside the caller's
  transaction, validates against the Zod `DomainEvent` union, and chains
  `previousEventId` per aggregate.
- **Auth API routes:** `POST /api/auth/register` (creates user + first org +
  OWNER membership + session), `POST /api/auth/login` (constant-time-ish
  credential check), `POST /api/auth/logout` (revokes session). All three
  rate-limited by an in-process token bucket (Phase 1 stopgap; Redis in Phase 9).
- **Auth UI + protected `/app` shell:** `/register`, `/login`, `/app` dashboard
  showing real memberships from the DB (empty state when none). Layout
  redirects to `/login` when unauthenticated.
- **Tracker:** Phase 1 rows updated to reflect real state; row-level security
  and OAuth broken out as explicit follow-up items.

### Added — Phase 0 foundations

- Monorepo skeleton (`apps/`, `packages/`, `services/`, `infrastructure/`, `docs/`).
- `docs/GOD-MACHINE-ARCHITECTURE.md` — full kernel + execution-chain design.
- `docs/BUILD-TRACKER.md` — canonical status of every tracker item.
- `docs/THREAT-MODEL.md` — adversaries, controls, Phase 1 blockers.
- ADRs 0001–0005 (monorepo/language, router abstraction, GOD Claw boundary,
  storage on Postgres+pgvector, mission + event model).
- `packages/schemas` — Zod schemas for `Mission`, `Task`, `AgentDefinition`,
  `ToolDescriptor`, `DomainEvent`, and typed IDs.
- `apps/web` — Next.js app with honest `/` and `/god` landing pages, a
  `/api/health` liveness probe, `robots.txt`, `sitemap.xml`, 404 and error
  boundaries. No fake data.
- `infrastructure/compose/dev.yml` — local Postgres+pgvector, Redis, MinIO.
- `.github/workflows/ci.yml` — typecheck, build, required-docs assertion.
- `SECURITY.md`, `CONTRIBUTING.md`, `LICENSE` (Apache-2.0), `.gitignore`,
  `.editorconfig`, `.env.example`.

### Not yet added

Every Phase 1–14 item in [`docs/BUILD-TRACKER.md`](docs/BUILD-TRACKER.md).
This is by design — the tracker is the honest surface.
