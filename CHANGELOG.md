# Changelog

All notable changes to this project are recorded here. Format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project uses
semantic versioning once it reaches `0.1.0`.

## [Unreleased]

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
