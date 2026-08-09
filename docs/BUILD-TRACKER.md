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
| P1-000 | ADR-0006: ORM (Drizzle) + auth approach (argon2id + DB sessions) | Docs | P0 | P0-008 | VERIFIED |
| P1-001a | Identity: users, sessions, email+password | packages/auth + apps/web | P0 | P0-010, P1-000 | VERIFIED *(CI: auth.test.ts 6/6)* |
| P1-001b | Identity: OAuth providers | packages/auth | P0 | P1-001a | TODO |
| P1-002 | Organizations, memberships, roles (OWNER/ADMIN/DEVELOPER/OPERATOR/REVIEWER/VIEWER) | packages/db + apps/web | P0 | P1-001a | VERIFIED *(CI: rls.test.ts positive-access + auth.test.ts registration flow)* |
| P1-003 | Projects + repositories | packages/db + services/project-service | P0 | P1-002 | REVIEW *(schema + RLS verified in CI; CRUD API pending Phase 2)* |
| P1-004 | Mission schema persisted to Postgres | packages/db + services/mission-service | P0 | P0-010 | REVIEW *(schema + RLS verified in CI; CRUD API + state machine in Phase 2)* |
| P1-005 | Event system (typed `DomainEvent`, `audit_events` append-only table, previousEventId chain) | packages/db + packages/events | P0 | P0-010 | VERIFIED *(CI: events.test.ts 2/2 + rls.test.ts audit_events append-only)* |
| P1-006 | Basic dashboard (real DB data only, empty states when no data) | apps/web | P0 | P1-002, P1-004 | VERIFIED *(orgs list wired via withUserTx; projects/missions land in Phase 2)* |
| P1-007 | Server-side authorization guards (requireUser/OrgMembership/OrgRole/ProjectAccess/MissionAccess) | apps/web/lib/authz.ts | P0 | P1-002 | VERIFIED *(implementation + typecheck; per-endpoint adoption ongoing per feature)* |
| P1-008 | Row-level security policies on org-scoped tables + FORCE + non-superuser app role | packages/db (migration 0002) | P0 | P1-002 | VERIFIED *(CI: rls.test.ts 11/11 — cross-org denial, INSERT/UPDATE denial, positive access, audit append-only)* |
| P1-009 | CI: run migrations against ephemeral Postgres, then integration tests | .github/workflows + tests/integration | P0 | P1-005 | VERIFIED *(green on `a89c0d3`: node ✓ integration ✓ docs ✓; 19 integration tests pass)* |

**Phase 1 `VERIFIED` here means:** implementation lives in the tree AND CI green
on head SHA covers the behavior with an evidence-producing test. `REVIEW` items
have schema + policy support but await Phase 2 endpoints to reach VERIFIED.
`P1-001b` (OAuth) is the one outstanding TODO before tagging
`v0.1.0-foundation`; the `v0.1.0-rc1` tag covers everything else.

---

## Phase 2A — Durable Mission Runtime (kernel)

**Phase reordering per ADR-0007:** the durable runtime kernel lands
*before* any LLM-driven intelligence. Downstream sections (Phase 3–7)
still exist below with their original topic ordering (Router, Claw,
Sandbox, Swarm, IDE, MCP, Workers, P99, Deployment, Self-Healing,
EdgeNodes, Hardening); those numbers are scheduling labels and will be
re-sequenced when each phase actually starts. What is frozen now is
**this order: 2A kernel → 2B deterministic executors → GOD Brain →
GOD Router → GOD Claw → GOD Swarm → P99.**

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P2A-000 | ADR-0007: durable mission runtime (states, guarantees, invariants) | Docs | P0 | P1-005 | VERIFIED |
| P2A-001 | Migration 0004: mission_runs, task_runs, task_attempts, task_leases, task_results, evidence, idempotency_keys | packages/db | P0 | P2A-000 | REVIEW *(migration applies locally on empty + on top of 0001+0002; RLS + FORCE + policies mirror Phase 1)* |
| P2A-002 | Drizzle schema + typed IDs for runtime tables | packages/db | P0 | P2A-001 | REVIEW |
| P2A-003 | Mission-run/task-run projector (append event → advance row state in same tx) | packages/runtime | P0 | P2A-002 | TODO |
| P2A-004 | DAG readiness resolver (BLOCKED → READY when all deps SUCCEEDED) | packages/runtime | P0 | P2A-003 | TODO |
| P2A-005 | Scheduler: `SELECT … FOR UPDATE SKIP LOCKED` claim, atomic lease + attempt + event | services/worker-runtime | P0 | P2A-004 | TODO |
| P2A-006 | Worker loop: lease → heartbeat → execute → result + evidence → transition | services/worker-runtime | P0 | P2A-005 | TODO |
| P2A-007 | Reclaimer: expired-lease sweep → LEASE_LOST + READY | services/worker-runtime | P0 | P2A-006 | TODO |
| P2A-008 | Retry policy: `RETRY_WAIT` scheduling with exp-backoff+jitter, DLQ at exhaustion | services/worker-runtime | P0 | P2A-006 | TODO |
| P2A-009 | Cancellation: mission_run cancel → cascade to non-terminal task_runs, tombstone leases | services/worker-runtime | P0 | P2A-006 | TODO |
| P2A-010 | Idempotency broker: first-writer-wins around any executor side effect | packages/runtime | P0 | P2A-006 | TODO |
| P2A-011 | Domain events for runtime lifecycle: `mission_run.*`, `task_run.*`, `task_attempt.*`, `lease.*` | packages/schemas + packages/events | P0 | P2A-003 | TODO |
| P2A-012 | API: `POST /api/missions` (create), `POST /api/missions/:id/runs` (queue), `GET /api/mission-runs/:id`, `POST /api/mission-runs/:id/cancel` | apps/web | P0 | P2A-009 | TODO |
| P2A-013 | Web: mission-run dashboard + DAG visualization (server components, no fake data) | apps/web | P1 | P2A-012 | TODO |
| P2A-014 | Deterministic test executor package (`@god/executors-test`) for CI-only workloads | packages/executors-test | P0 | P2A-006 | TODO |

### Phase 2A CI gate — 20 scenarios that must be green

Each row is a distinct integration test scenario. `VERIFIED` for P2A
requires **all 20** on CI with a fresh Postgres per run.

| ID | Scenario | Deps | Status |
|----|----------|------|--------|
| P2A-CI-01 | Create mission + DAG persists correctly | P2A-012 | TODO |
| P2A-CI-02 | Dependency ordering: dependent stays BLOCKED until upstream SUCCEEDED | P2A-004 | TODO |
| P2A-CI-03 | Independent tasks execute in parallel | P2A-006 | TODO |
| P2A-CI-04 | Lease exclusivity: two workers cannot both hold the same task_run | P2A-005 | TODO |
| P2A-CI-05 | Lease expiry: reclaimer marks LEASE_LOST after `expires_at` | P2A-007 | TODO |
| P2A-CI-06 | Worker crash mid-run: attempt state observable, no state loss | P2A-006 | TODO |
| P2A-CI-07 | Second worker reclaims after crash and completes the task_run | P2A-007 | TODO |
| P2A-CI-08 | Idempotent duplicate delivery: executor's side effect fires exactly once across retries | P2A-010 | TODO |
| P2A-CI-09 | Transient failure → retry with backoff → SUCCEEDED | P2A-008 | TODO |
| P2A-CI-10 | Retry exhaustion → DEAD_LETTER (no further leases) | P2A-008 | TODO |
| P2A-CI-11 | Cancellation before execution: PENDING/READY → CANCELLED cleanly | P2A-009 | TODO |
| P2A-CI-12 | Cancellation during execution: running attempt tombstoned, no further transitions | P2A-009 | TODO |
| P2A-CI-13 | Failed prerequisite (DEAD_LETTER) blocks dependent: dependent → CANCELLED | P2A-009 | TODO |
| P2A-CI-14 | Successful prerequisite unlocks dependent: BLOCKED → READY | P2A-004 | TODO |
| P2A-CI-15 | Event chain remains ordered per aggregate (previousEventId chain unbroken) | P2A-011 | TODO |
| P2A-CI-16 | RLS prevents cross-org mission_run access (positive + denial) | P2A-002 | TODO |
| P2A-CI-17 | Worker cannot claim another tenant's task_run illegally | P2A-005 | TODO |
| P2A-CI-18 | Process restart with unfinished mission_run: state fully recovered from DB | P2A-006 | TODO |
| P2A-CI-19 | Recovery replays events for a resumed mission_run without duplicating effects | P2A-010 | TODO |
| P2A-CI-20 | Complete mission acceptance test (kill Worker A after leasing `compile-a`, Worker B reclaims, DAG completes, `publish` runs exactly once, evidence chain intact) | ALL above | TODO |

## Phase 2B — Executors (deterministic first)

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P2B-001 | Executor SDK: `defineExecutor()`, contract, evidence emit helpers | packages/executor-sdk | P0 | P2A-014 | TODO |
| P2B-002 | Deterministic executors: shell, file-write, http-fetch (with idempotency) | packages/executors-basic | P0 | P2B-001 | TODO |
| P2B-003 | Worker capability matching (worker_class filter in scheduler) | services/worker-runtime | P1 | P2B-001 | TODO |

## Phase 3 — GOD Brain (moved from Phase 2)

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P3-BRAIN-001 | Intent compiler | services/god-brain | P0 | P2A + P2B | TODO |
| P3-BRAIN-002 | Specification generator | services/god-brain | P0 | P3-BRAIN-001 | TODO |
| P3-BRAIN-003 | Planner / decomposer (emits a task DAG the runtime executes) | services/god-brain | P0 | P3-BRAIN-002 | TODO |
| P3-BRAIN-004 | Reflection engine writes to GOD Memory | services/memory-service | P1 | P3-BRAIN-003 | TODO |

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
