# Changelog

All notable changes to this project are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project uses
semantic versioning once it reaches `0.1.0`.

## [Unreleased]

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
