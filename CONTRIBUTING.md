# Contributing

Welcome. Before you start, read:

1. [`README.md`](README.md) — what this project is and what it isn't.
2. [`docs/GOD-MACHINE-ARCHITECTURE.md`](docs/GOD-MACHINE-ARCHITECTURE.md) — how it's designed.
3. [`docs/BUILD-TRACKER.md`](docs/BUILD-TRACKER.md) — what has actually been built.
4. [`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md) — the adversaries we design against.
5. [`SECURITY.md`](SECURITY.md) — how to report vulnerabilities.

## Toolchain

- Node.js 20+
- pnpm 9+
- Docker (for Postgres/Redis/MinIO)
- Rust stable (required from Phase 4 onward; not needed yet)

## Local setup

```bash
pnpm install
cp .env.example .env
docker compose -f infrastructure/compose/dev.yml up -d
pnpm --filter @god/web dev
```

## Ways to help right now (Phase 0)

- Read the architecture and open issues where it is unclear.
- Propose ADRs for open questions listed at the bottom of existing ADRs.
- Add or refine entries in `docs/BUILD-TRACKER.md`.
- Improve schemas in `packages/schemas` with better types and validations.

## Branching and commits

- Work on feature branches; PR into `main`.
- Commits: imperative subject, ≤72 chars ("Add mission status projection"),
  optional body explaining the *why*.
- Small PRs. If a change spans several tracker items, split it.

## Adding an ADR

- Copy an existing ADR from `docs/adr/`.
- Number sequentially. Do not skip numbers.
- Status starts `Proposed`; a maintainer moves it to `Accepted` or `Rejected`.
- ADRs are immutable once accepted. To change one, write a new ADR that
  supersedes it.

## Code standards

- TypeScript strict mode is on. No `any`, no non-null assertions.
- Every mutation server endpoint has a server-side authorization check.
- Every tool descriptor carries a full permission descriptor and risk
  classification — see [ADR-0003](docs/adr/0003-god-claw-execution-boundary.md).
- Every domain event is a discriminated union member — see [ADR-0005](docs/adr/0005-mission-and-event-model.md).
- No secrets in logs. No secrets in error messages. No secrets in model
  prompts.
- No fake data in the UI. Use empty states or explicit "not yet built" copy.

## Testing

- Unit tests live next to the code they test.
- Integration tests live under `tests/integration/`.
- Security tests (authorization matrices, sandbox escape attempts, secret
  redaction) live under `tests/security/`.
- Never disable a test to make CI green. Fix the failure.

## Reviewing

- Two-reviewer requirement for changes in the security-critical paths listed
  in [`SECURITY.md`](SECURITY.md#supply-chain).
- Reviewers are responsible for asking "what could go wrong?", not just
  "does this compile?"

## Code of conduct

Be direct, kind, and specific. Attack ideas, not people. Do not use this
project to harm others.
