# GOD Machine — Build Tracker

This file is the source of truth for what has actually been built. If a feature
is not listed as `VERIFIED` here, it is not production-ready — regardless of
what UI copy, README claims, or agent output implies.

Status vocabulary (from the master spec):

- `TODO` — not started.
- `IN_PROGRESS` — actively being built this phase.
- `BLOCKED` — cannot proceed until a dependency lands.
- `REVIEW` — implementation exists, awaiting evidence-backed review.
- `VERIFIED` — implementation exists, tests pass, docs updated, security implications addressed.

**A row moves to `VERIFIED` only when the P99 gates applicable to that row have
produced evidence artifacts.** Filling this in from vibes is the exact failure
mode the P99 engine exists to prevent.

Legend for columns:
- **Phase** — the phase in which the item is scheduled (see spec §51).
- **Component** — top-level kernel component or subsystem.
- **Priority** — `P0` blocker for the phase, `P1` important, `P2` nice-to-have.
- **Deps** — other tracker IDs that must be `VERIFIED` first.

---

## Phase 0 — Foundations

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P0-001 | Monorepo skeleton (apps, packages, infrastructure, docs) | Repo | P0 | — | VERIFIED |
| P0-002 | Architecture document | Docs | P0 | — | VERIFIED |
| P0-003 | Build tracker (this document) | Docs | P0 | — | VERIFIED |
| P0-004 | Threat model | Security | P0 | P0-002 | VERIFIED |
| P0-005 | ADR-0001 monorepo + language choice | Docs | P0 | P0-002 | VERIFIED |
| P0-006 | ADR-0002 model router abstraction | Docs | P0 | P0-002 | VERIFIED |
| P0-007 | ADR-0003 GOD Claw execution boundary | Docs | P0 | P0-002 | VERIFIED |
| P0-008 | ADR-0004 storage: Postgres + pgvector | Docs | P0 | P0-002 | VERIFIED |
| P0-009 | ADR-0005 mission + event model | Docs | P0 | P0-002 | VERIFIED |
| P0-010 | Zod schemas for Mission, Task, Agent, Tool, Event | packages/schemas | P0 | P0-009 | REVIEW |
| P0-011 | Root `package.json`, workspaces, `tsconfig.base.json` | Repo | P0 | P0-001 | REVIEW |
| P0-012 | `.gitignore`, `.editorconfig`, `.env.example` | Repo | P0 | P0-001 | VERIFIED |
| P0-013 | Next.js `apps/web` scaffold with `/` and `/god` | apps/web | P0 | P0-011 | REVIEW |
| P0-014 | `docker-compose` for local Postgres + Redis + MinIO | infrastructure | P0 | P0-008 | REVIEW |
| P0-015 | CI workflow (typecheck, build, required-docs assertion) | .github/workflows | P0 | P0-011, P0-013 | REVIEW |
| P0-016 | `SECURITY.md`, `CONTRIBUTING.md`, `CHANGELOG.md`, `LICENSE` | Repo | P0 | — | VERIFIED |

**`REVIEW` here means:** the file exists and is well-formed, but no `pnpm install`
has run yet and no CI has verified it. Promote to `VERIFIED` after the first
green CI run against `main`.

**Exit criteria for Phase 0:** all rows above `VERIFIED`, and every reader can
answer "what is this project?" and "what does this repo contain today?" without
running a single command.

---

## Phase 1 — GOD Foundation

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P1-001 | Identity: users, sessions, password + OAuth | services/identity | P0 | P0-010 | TODO |
| P1-002 | Organizations, memberships, roles (OWNER/ADMIN/DEVELOPER/OPERATOR/REVIEWER/VIEWER) | services/identity | P0 | P1-001 | TODO |
| P1-003 | Projects + repositories | services/project-service | P0 | P1-002 | TODO |
| P1-004 | Mission schema persisted to Postgres | services/mission-service | P0 | P0-010 | TODO |
| P1-005 | Event system (typed `DomainEvent`, `audit_events` append-only table) | services/observability | P0 | P0-010 | TODO |
| P1-006 | Basic dashboard (real DB data only, empty states when no data) | apps/web | P0 | P1-002, P1-004 | TODO |
| P1-007 | Server-side authorization checks on every mutation | services/identity | P0 | P1-002 | TODO |

---

## Phase 2 — GOD Brain

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P2-001 | Intent compiler | services/god-brain | P0 | P1-004 | TODO |
| P2-002 | Specification generator | services/god-brain | P0 | P2-001 | TODO |
| P2-003 | Planner / decomposer | services/god-brain | P0 | P2-002 | TODO |
| P2-004 | Task DAG persistence + state machine | services/mission-service | P0 | P1-004 | TODO |
| P2-005 | Mission execution state controller | services/mission-service | P0 | P2-004 | TODO |
| P2-006 | Reflection engine writes to GOD Memory | services/memory-service | P1 | P2-005 | TODO |

---

## Phase 3 — GOD Router

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P3-001 | Provider adapter interface | services/god-router | P0 | P0-010 | TODO |
| P3-002 | Local provider (Ollama-compatible) | services/god-router | P0 | P3-001 | TODO |
| P3-003 | OpenAI-compatible provider | services/god-router | P0 | P3-001 | TODO |
| P3-004 | Anthropic provider | services/god-router | P0 | P3-001 | TODO |
| P3-005 | Router scoring + user modes (FREE/PRIVATE/BALANCED/FAST/QUALITY/P99) | services/god-router | P0 | P3-001 | TODO |
| P3-006 | Fallback + circuit breaker + provider health | services/god-router | P0 | P3-001 | TODO |
| P3-007 | Usage + cost tracking per model call | services/god-router | P0 | P3-001 | TODO |

---

## Phase 4 — GOD Claw

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P4-001 | Tool contract + registry | services/god-claw | P0 | P0-010 | TODO |
| P4-002 | Filesystem tool (workspace-scoped) | services/god-claw | P0 | P4-001 | TODO |
| P4-003 | Git tool | services/god-claw | P0 | P4-001 | TODO |
| P4-004 | Terminal / shell tool | services/god-claw | P0 | P4-001 | TODO |
| P4-005 | Guardian policy engine + risk classification | services/god-claw | P0 | P4-001 | TODO |
| P4-006 | Approval workflow (per-call, per-mission, standing) | services/god-claw | P0 | P4-005 | TODO |
| P4-007 | Credential broker (secrets never leave the sandbox) | services/god-claw | P0 | P4-005 | TODO |

---

## Phase 5 — Sandbox

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P5-001 | Sandbox abstraction | services/sandbox-manager | P0 | P4-001 | TODO |
| P5-002 | Docker sandbox implementation | services/sandbox-manager | P0 | P5-001 | TODO |
| P5-003 | Resource limits (CPU, RAM, disk, timeout, PID) | services/sandbox-manager | P0 | P5-002 | TODO |
| P5-004 | Network egress policy | services/sandbox-manager | P0 | P5-002 | TODO |
| P5-005 | Filesystem scope policy | services/sandbox-manager | P0 | P5-002 | TODO |
| P5-006 | Artifact capture + persistence | services/sandbox-manager | P0 | P5-002 | TODO |

---

## Phase 6 — Agent Swarm

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P6-001 | Agent runtime (spawn, delegate, complete) | services/agent-runtime | P0 | P2-005, P4-001 | TODO |
| P6-002 | Agent SDK (`defineAgent`, `spawnAgent`, `delegate`, `complete`) | packages/agent-sdk | P0 | P6-001 | TODO |
| P6-003 | Built-in agents: Oracle, Planner, Architect, Coder, Reviewer, Security, QA, DevOps, Browser, SRE, Judge, Guardian | services/agent-runtime | P0 | P6-002 | TODO |
| P6-004 | Delegation + parallel execution guarded by depth/agents/runtime/cost/token/retry caps | services/agent-runtime | P0 | P6-001 | TODO |
| P6-005 | Reviewer / Judge / Critic loops | services/agent-runtime | P0 | P6-001 | TODO |

---

## Phase 7 — Agentic IDE

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P7-001 | Editor (Monaco), file tree, semantic search | apps/web | P0 | P1-006 | TODO |
| P7-002 | Terminal (xterm.js) wired through GOD Claw | apps/web | P0 | P4-004, P7-001 | TODO |
| P7-003 | Mission panel (DAG, agents, logs, tool calls, diffs) | apps/web | P0 | P2-005 | TODO |
| P7-004 | Diff view + commit workflow | apps/web | P0 | P4-003, P7-001 | TODO |
| P7-005 | Browser preview | apps/web | P0 | P7-001 | TODO |
| P7-006 | Approval queue UI | apps/web | P0 | P4-006 | TODO |
| P7-007 | Command palette | apps/web | P1 | P7-001 | TODO |

---

## Phase 8 — MCP

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P8-001 | MCP gateway service | services/mcp-gateway | P0 | P4-001 | TODO |
| P8-002 | MCP tool contract normalization | services/mcp-gateway | P0 | P8-001 | TODO |
| P8-003 | MCP server registry + per-org permissions | services/mcp-gateway | P0 | P8-001 | TODO |

---

## Phase 9 — Workers

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P9-001 | Durable queue (survives restart) | services/worker-runtime | P0 | P1-005 | TODO |
| P9-002 | Scheduled jobs (cron, webhook, git event, monitoring event) | services/worker-runtime | P0 | P9-001 | TODO |
| P9-003 | Persistent worker execution | services/worker-runtime | P0 | P9-001 | TODO |

---

## Phase 10 — P99

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P10-001 | Gate runner (executes a required gate, returns evidence artifact) | services/p99-engine | P0 | P5-006 | TODO |
| P10-002 | Built-in gates: build, lint, typecheck, unit tests, integration tests, secret scan, dependency audit | services/p99-engine | P0 | P10-001 | TODO |
| P10-003 | Additional gates: E2E, browser, visual regression, a11y, SAST, container scan, IaC scan | services/p99-engine | P1 | P10-001 | TODO |
| P10-004 | Confidence report generation | services/p99-engine | P0 | P10-001 | TODO |
| P10-005 | `p99` config schema per project | packages/schemas | P0 | P0-010 | TODO |

---

## Phase 11 — Deployment

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P11-001 | Deployment adapter interface | services/deployment-service | P0 | P4-001 | TODO |
| P11-002 | Docker Compose adapter | services/deployment-service | P0 | P11-001 | TODO |
| P11-003 | Vercel adapter | services/deployment-service | P1 | P11-001 | TODO |
| P11-004 | Kubernetes adapter | services/deployment-service | P1 | P11-001 | TODO |
| P11-005 | Health verification + rollback | services/deployment-service | P0 | P11-001 | TODO |

---

## Phase 12 — Self-Healing

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P12-001 | Incident ingestion | services/observability | P0 | P1-005 | TODO |
| P12-002 | Diagnosis mission template | services/agent-runtime | P0 | P6-001 | TODO |
| P12-003 | Repair mission template | services/agent-runtime | P0 | P6-001 | TODO |
| P12-004 | Canary + auto-rollback flow | services/deployment-service | P0 | P11-005 | TODO |
| P12-005 | Autonomous repair policy (OFF / PROPOSE / TEST / CANARY / AUTONOMOUS_LOW_RISK) | services/deployment-service | P0 | P4-005 | TODO |

---

## Phase 13 — EdgeNodes

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P13-001 | Node runtime binary | services/node-scheduler | P0 | P5-002 | TODO |
| P13-002 | Node registration + trust tiers | services/node-scheduler | P0 | P13-001 | TODO |
| P13-003 | Job scheduler respecting sensitivity + trust + hardware + region + cost + latency | services/node-scheduler | P0 | P13-002 | TODO |
| P13-004 | Distributed job execution | services/node-scheduler | P0 | P13-003 | TODO |

---

## Phase 14 — Hardening & Release

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P14-001 | Load tests | tests | P0 | — | TODO |
| P14-002 | Security review + pen test | Security | P0 | — | TODO |
| P14-003 | Documentation completeness pass | docs | P0 | — | TODO |
| P14-004 | Installer (`curl -fsSL https://codingagent.in/install | sh`) | scripts | P0 | — | TODO |
| P14-005 | Signed release artifacts | .github/workflows | P0 | — | TODO |

---

## Cross-cutting: CLI

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| CLI-001 | `codingagent login`, `init`, `open`, `god`, `run`, `agents`, `models`, `mcp`, `tools`, `node`, `sandbox`, `deploy`, `p99`, `doctor` | apps/cli | P0 (per phase) | Varies | TODO |

## Cross-cutting: SDK

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| SDK-001 | Agent SDK | packages/agent-sdk | P0 | P6-001 | TODO |
| SDK-002 | Tool SDK | packages/tool-sdk | P0 | P4-001 | TODO |
| SDK-003 | Model SDK | packages/model-sdk | P0 | P3-001 | TODO |
| SDK-004 | Workflow SDK | packages/workflow-sdk | P0 | P9-001 | TODO |
| SDK-005 | Node SDK | packages/node-sdk | P0 | P13-001 | TODO |

## Cross-cutting: API

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| API-001 | `/api/v1/*` REST surface with OpenAPI generation | services/api-gateway | P0 (per phase) | P1-007 | TODO |

---

## Production readiness checklist (spec §50)

Every checkbox must be evidenced before the platform is called production-ready.

- [ ] TypeScript compiles with no errors
- [ ] Rust builds with no errors
- [ ] Lint clean
- [ ] Migrations succeed on empty DB
- [ ] Migrations succeed on upgrade path
- [ ] Authentication works
- [ ] Authorization enforced server-side
- [ ] Mission state persists across restarts
- [ ] Queue survives restart
- [ ] Provider adapters fail cleanly
- [ ] Tool permission enforcement works
- [ ] Sandbox isolation matches documented level
- [ ] Sensitive operations require policy approval
- [ ] Secrets are protected
- [ ] Logs do not contain secrets
- [ ] P99 reports use real evidence
- [ ] No fake metrics
- [ ] No fake provider status
- [ ] No nonfunctional navigation
- [ ] No placeholder production pages
- [ ] Mobile/responsive UX works
- [ ] Accessibility basics pass
- [ ] Public SEO metadata valid
- [ ] Error boundaries exist
- [ ] 404/500 handling exists
- [ ] Backups + recovery documented
- [ ] Deployment reproducible

None of these are checked. That is honest, not a bug.
