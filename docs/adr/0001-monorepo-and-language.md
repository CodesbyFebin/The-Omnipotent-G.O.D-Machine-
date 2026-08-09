# ADR-0001: Monorepo structure and language split

**Status:** Accepted
**Date:** 2026-08-09
**Deciders:** Founding engineering

## Context

The GOD Machine platform spans a web application, a desktop shell, a CLI, a
family of backend services (identity, mission, brain, router, claw,
sandbox-manager, agent-runtime, worker-runtime, deployment, p99-engine,
mcp-gateway, node-scheduler, memory, observability), and a distributed node
runtime. Every component shares core schemas (Mission, Task, Agent, Tool,
Event) and calls into each other.

Options considered:

1. **Multi-repo, one repo per service.**
2. **Two repos: `god-core` (services) + `god-clients` (web/desktop/CLI).**
3. **Single monorepo with workspaces.**

## Decision

**Single monorepo with workspaces.** Structure:

```
apps/         user-facing surfaces (web, desktop, cli, docs, admin, ide)
services/     backend services
packages/     shared libraries (schemas, SDKs, ui, config, telemetry)
infrastructure/  docker, compose, k8s/helm, terraform
docs/         architecture, ADRs, guides
scripts/      dev tooling
tests/        cross-service integration and E2E
.github/      workflows
```

Package manager: **pnpm** with a `pnpm-workspace.yaml`.

Language split:

- **TypeScript** — apps/web, apps/desktop shell UI, apps/cli, packages/*,
  services/identity, services/project-service, services/mission-service,
  services/god-brain (orchestration), services/god-router (adapters),
  services/mcp-gateway, services/deployment-service, services/observability,
  services/api-gateway.
- **Rust** — services/god-claw (execution boundary, sandboxing),
  services/sandbox-manager, services/node-scheduler + node runtime,
  services/agent-runtime (the parts touching sandbox), packages/security-sdk
  where memory-safety or process-supervision is critical.

The **language split is decided by what the code touches**, not by preference.
Code that supervises untrusted processes, manages sandboxes, or ships to
end-user devices is Rust. Orchestration, business logic, and UI is TypeScript.

## Consequences

- One `pnpm install` for the whole tree. Shared TypeScript config in
  `tsconfig.base.json`. Shared lint config.
- Rust services live under `services/*/` with their own `Cargo.toml` and
  are built via `cargo` invoked from the root scripts.
- Cross-language boundaries speak either JSON over HTTP/gRPC or a well-defined
  IPC protocol — never shared in-process state.
- No microservice is introduced without evidence it needs to be separate.
  Phase 1 may collapse several TypeScript "services" into a single deployable
  binary; the directory boundary preserves the option to split later.
- The Rust toolchain becomes a required contributor dependency by Phase 4.
  Documented in `CONTRIBUTING.md`.

## Rejected alternatives

- **Multi-repo:** rejected because every schema change would require
  coordinated releases across N repositories, and the schemas change often
  during Phases 0–6.
- **Two repos:** rejected because the CLI depends on service schemas, so the
  split does not cleanly separate anything.

## Open questions this ADR does not resolve

- The exact Rust ↔ TypeScript IPC protocol for the agent runtime (deferred
  to Phase 6).
- Whether the desktop shell uses Tauri or a headless daemon + browser
  (deferred to Phase 7).
