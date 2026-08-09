# ADR-0006: ORM = Drizzle; auth = argon2id + DB-backed sessions

**Status:** Accepted
**Date:** 2026-08-09
**Deciders:** Founding engineering
**Supersedes / superseded by:** —
**Depends on:** [ADR-0004](0004-storage-postgres-pgvector.md), [ADR-0005](0005-mission-and-event-model.md)

## Context

ADR-0004 committed the platform to Postgres and deliberately deferred the ORM
choice to Phase 1. Phase 1's identity/projects/mission tables need to land, so
the choice is now on the critical path. Similarly, Phase 1 auth needs a
concrete decision between the credible options: password vs magic-link,
argon2id vs bcrypt vs scrypt, DB-backed sessions vs stateless JWTs, OAuth
integrated up front vs pluggable later.

### ORM options considered

1. **Prisma** — mature, popular, generates a client from a schema DSL.
2. **Drizzle ORM + Drizzle Kit** — TypeScript-first, query-builder style, SQL
   migrations, no separate runtime.
3. **Kysely** — pure query builder with excellent types, no schema DSL, no
   migration story of its own.
4. **Raw SQL + `pgtyped`** — minimal, maximum control, minimal ergonomics.

### Auth options considered

1. **Email + password** with a strong hash (argon2id / bcrypt / scrypt).
2. **Passwordless magic link** as the only auth path.
3. **OAuth only** (GitHub / Google) from day one.
4. **JWT sessions** (stateless).
5. **DB-backed opaque sessions** (revocable, small cookie).

## Decision

### ORM — **Drizzle ORM + Drizzle Kit**

Drizzle is our TypeScript query layer. Migrations are versioned SQL files under
`packages/db/migrations/` produced from `drizzle-kit generate`. The generated
Drizzle schema in `packages/db/src/schema/` is the type source for the rest of
the platform.

Reasoning:

- **No runtime code generation.** Prisma's generated client is a separate
  build step and a separate process to run in CI. Drizzle's schemas are just
  TypeScript files that import cleanly into services.
- **SQL migrations we can read.** Drizzle Kit emits SQL. That means schema
  history is reviewable line-by-line in PRs, and hand-edits (e.g. Postgres
  RLS policies, index hints, `CREATE EXTENSION vector`) are natural. Prisma's
  migration files are also SQL, but the primary schema surface is a DSL,
  which forks the mental model when we need Postgres-native features.
- **Postgres-native support.** JSONB with typed inference, arrays, `vector`
  columns via `pgvector`, row-level security policies — Drizzle exposes all of
  these without escape hatches.
- **Query builder ergonomics.** Types flow from schema → query → result. No
  need for a separate `Kysely`-style layer over the top.
- **Transaction-first API.** Every event append and every mission mutation
  runs inside a transaction that also writes the audit event — Drizzle's
  transaction signature makes this straightforward.

### Auth — **email+password with argon2id + DB-backed opaque sessions**

The auth primitives ship as `packages/auth`. Concretely:

- **Password hash:** argon2id via `@node-rs/argon2` (Rust-backed, no native
  build headaches on developer machines).
- **Password policy:** minimum 12 characters, no other composition rules
  (research does not support them). Reject common-password matches at signup.
- **Session token:** 32 random bytes, base64url-encoded, opaque. Stored
  hashed in the `sessions` table (SHA-256 so a database read alone cannot
  impersonate a user).
- **Cookie:** `__Host-god_session`, `HttpOnly`, `Secure` (in production),
  `SameSite=Lax`, path `/`, 30-day rolling expiry with server-side sliding.
- **Revocation:** every session row has `revoked_at`; logout sets it; the
  auth middleware ignores revoked sessions.
- **CSRF:** `SameSite=Lax` covers most mutations; state-changing endpoints
  additionally require a double-submit CSRF token when the request is
  cross-origin. Same-origin `fetch` from the app doesn't need one.
- **Rate limiting:** login and password-reset endpoints are rate-limited by
  IP + email. Phase 1 uses an in-process token bucket; Phase 9 promotes to
  Redis when the worker runtime lands. This is called out in the tracker.
- **Recovery / lockout:** email-based reset (Phase 1.5). Account lockout
  after 10 failed logins within 15 minutes is Phase 1.5.

**OAuth is deferred to a follow-up ADR (0007).** The auth interface is
designed so an OAuth provider plugs in as an alternate credential source
against the same `users` and `sessions` tables — email/password ships first
because it exercises every seam (registration, hashing, sessions, revocation,
CSRF) that OAuth also needs.

**JWT sessions are rejected.** Revocation matters more than statelessness at
our scale. A stolen or misissued JWT is valid until expiry unless we build a
revocation list — at which point we've reintroduced the DB lookup we thought
we avoided. DB-backed opaque sessions are simpler and safer.

**Magic-link-only is rejected as the sole path** — it makes self-hosted
deployments without SMTP configured hard to use. Magic link may ship as an
alternate credential later; it is not the primary.

## Consequences

- New workspace: `packages/db` — Drizzle schema + migrations + connection
  pool + transaction helper. Depended on by every service.
- New workspace: `packages/auth` — password hash/verify, session
  create/verify, cookie helpers, CSRF helpers.
- New workspace: `packages/events` — typed `appendEvent(tx, event)` helper
  used by every mutation.
- Migrations live under `packages/db/migrations/`, applied by
  `pnpm --filter @god/db migrate`. CI runs migrations against an ephemeral
  Postgres container before any test suite touches the DB.
- `pgvector` and the initial audit-event chain trigger are installed by the
  first migration. Extensions are declared explicitly so a fresh Postgres
  matches production.
- Every mutation endpoint uses `withAuthenticatedTx({ orgId, userId }, ...)`
  which opens a transaction, sets `SET LOCAL app.current_org = $1` and
  `SET LOCAL app.current_user = $2`, runs the callback, and — this is the
  invariant — enforces that any `DomainEvent` produced is appended inside the
  same transaction. This is the mechanism that ADR-0005's "event log is
  authoritative" claim rests on.
- Row-level security policies for org-scoped tables are added in a follow-up
  migration (`0002_row_level_security.sql`) once the initial schema is
  reviewed. They read `current_setting('app.current_org', true)`.

## Rejected alternatives

- **Prisma:** rejected for the two reasons above (extra process, DSL vs SQL).
  Fine tool; wrong ergonomic fit for a platform that will use RLS, `vector`
  columns, and explicit transactions everywhere.
- **Kysely alone:** rejected because we still need a migration story, and
  bolting migrations on top of Kysely is reinventing Drizzle Kit.
- **Raw SQL + pgtyped:** rejected as the *only* layer. Excellent for
  performance-critical queries; painful for the 95% of mutations that don't
  need it. May be used inside `packages/db` for specific hot paths later.
- **Argon2 without a Rust backend:** rejected — pure-JS implementations are
  either too slow (real cost per login) or require a native gyp build that
  breaks on many contributor machines. `@node-rs/argon2` ships prebuilt
  binaries for the platforms we care about.

## Open questions this ADR does not resolve

- OAuth provider list and callback URL strategy — ADR-0007.
- Multi-factor authentication — not in Phase 1.
- Session pinning to IP or user-agent — likely no (breaks legitimate mobile
  network switches), but revisit if abuse patterns emerge.
- Cross-region session replication — deferred until deployments span regions.
