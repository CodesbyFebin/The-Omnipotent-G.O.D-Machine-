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

### Foundation (landed)

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P2A-000 | ADR-0007: durable mission runtime (states, guarantees, invariants, lease Model A, worker ownership rule) | Docs | P0 | P1-005 | VERIFIED |
| P2A-001 | Migration 0004: mission_runs, task_runs, task_attempts, task_leases, task_results, evidence, idempotency_keys — RLS + FORCE + policies + `god_app` grants | packages/db | P0 | P2A-000 | REVIEW *(applies cleanly on empty + on top of 0001+0002; Phase 1 suite still 19/19 green. Not VERIFIED — runtime integration tests are the only evidence that will unlock that state.)* |
| P2A-002 | Drizzle schema + typed IDs for runtime tables | packages/db | P0 | P2A-001 | REVIEW |

### Runtime kernel — implementation order (build in this sequence)

The state-transition kernel is P2A-010, not the worker. The worker (P2A-100)
is almost last — it should be boring orchestration over already-proven
primitives, per ADR-0007. Every row below imports its transitions from
P2A-010; no ORM update on runtime state lives outside `packages/runtime`.

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P2A-010 | State-transition kernel — one authoritative `transitionTaskRun(tx, id, expected, target, meta)` + siblings for mission_run and task_attempt; owns legal-transition validation, optimistic concurrency, timestamp changes, attempt association, event append, invariant enforcement. Legal task-run graph frozen as code (see ADR-0007 §Task states). | packages/runtime | P0 | P2A-002 | TODO |
| P2A-011 | Runtime domain events: `mission_run.*`, `task_run.*`, `task_attempt.*`, `task_lease.*` variants added to DomainEvent union in `packages/schemas`; `@god/events` handles the new discriminants | packages/schemas + packages/events | P0 | P2A-010 | TODO |
| P2A-012 | DAG dependency projector (materializes task_runs from a mission_run + task definitions and their task_dependencies) | packages/runtime | P0 | P2A-010 | TODO |
| P2A-013 | READY-task resolver (BLOCKED → READY when every dep is SUCCEEDED; dep CANCELLED / DEAD_LETTER → dependent CANCELLED) | packages/runtime | P0 | P2A-012 | TODO |
| P2A-014 | Atomic task claim: `SELECT … FOR UPDATE SKIP LOCKED` + insert lease + insert attempt + transition READY→LEASED + event, all in one tx | packages/runtime | P0 | P2A-013 | TODO |
| P2A-015 | Lease heartbeat: guarded UPDATE that fails loud when the lease was revoked or reclaimed | packages/runtime | P0 | P2A-014 | TODO |
| P2A-016 | Lease reclaimer: sweep `expires_at < now()` → task_attempt=LEASE_LOST + task_run=RETRY_WAIT/READY + event + DELETE lease | packages/runtime | P0 | P2A-015 | TODO |
| P2A-017 | Retry policy + DLQ: RETRY_WAIT scheduling with exp-backoff + jitter; RETRY_WAIT → READY at deadline; retry-exhaustion → DEAD_LETTER (terminal) | packages/runtime | P0 | P2A-016 | TODO |
| P2A-018 | Idempotency broker: first-writer-wins around every executor side effect via `idempotency_keys` | packages/runtime | P0 | P2A-010 | TODO |
| P2A-019 | Cancellation semantics: mission_run cancel cascades to non-terminal task_runs; running attempts tombstoned; heartbeat detects and fails | packages/runtime | P0 | P2A-015 | TODO |
| P2A-020 | Mission-run status aggregation: derive mission_run.status from its task_runs after every transition | packages/runtime | P0 | P2A-013 | TODO |

### Executors (P2B)

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P2B-000 | Deterministic executor interface: `defineExecutor()`, contract, evidence emit helpers, idempotency-scope helpers | packages/executor-sdk | P0 | P2A-018 | TODO |
| P2B-001 | Deterministic test executor (`@god/executors-test`) for CI: shell-echo, file-write, sleep, controlled-failure — used by every P2C scenario | packages/executors-test | P0 | P2B-000 | TODO |
| P2B-002 | Immutable `task_results` + `evidence` write helpers (executor SDK enforces write-once; RLS also enforces) | packages/executor-sdk | P0 | P2B-000 | TODO |

### Worker + API + UI (P2A-100 range — after kernel is proven)

| ID | Item | Component | Priority | Deps | Status |
|----|------|-----------|----------|------|--------|
| P2A-100 | Worker loop: claim → heartbeat → execute → result + evidence → transition. Boring orchestration over P2A-010..019. | services/worker-runtime | P0 | P2A-019, P2B-001 | TODO |
| P2A-101 | Mission APIs: `POST /api/missions`, `POST /api/missions/:id/runs`, `GET /api/mission-runs/:id`, `POST /api/mission-runs/:id/cancel` | apps/web | P0 | P2A-100 | TODO |
| P2A-102 | Mission-run dashboard + DAG visualization (server components; real DB data only) | apps/web | P1 | P2A-101 | TODO |

### CI gate (P2C) — 20 scenarios; land incrementally alongside kernel commits

Each row is a distinct integration test scenario. **`P2A` moves to VERIFIED
only when all 20 are green on a fresh Postgres per run.** Land them as
each primitive lands — don't accumulate untested interactions.

| ID | Scenario | Lands with | Status |
|----|----------|------------|--------|
| P2C-001 | Illegal transition rejection (transitionTaskRun rejects e.g. SUCCEEDED → LEASED) | P2A-010 | TODO |
| P2C-002 | Runtime DomainEvent parses + chains per aggregate | P2A-011 | TODO |
| P2C-003 | DAG projector produces exactly one task_run per task definition per mission_run | P2A-012 | TODO |
| P2C-004 | Dependency ordering: dependent stays BLOCKED until upstream SUCCEEDED | P2A-013 | TODO |
| P2C-005 | Successful prerequisite unlocks dependent: BLOCKED → READY | P2A-013 | TODO |
| P2C-006 | Concurrent claim exclusivity: two workers, one gets LEASED, the other gets nothing | P2A-014 | TODO |
| P2C-007 | Lease + heartbeat: heartbeat extends `expires_at`; unrelated worker cannot heartbeat someone else's lease | P2A-015 | TODO |
| P2C-008 | Lease expiry: reclaimer transitions attempt=LEASE_LOST + task_run→RETRY_WAIT/READY after `expires_at` | P2A-016 | TODO |
| P2C-009 | Worker crash mid-run: attempt observable; second worker reclaims and completes | P2A-016 | TODO |
| P2C-010 | Transient failure → RETRY_WAIT with backoff → READY → SUCCEEDED | P2A-017 | TODO |
| P2C-011 | Retry exhaustion → DEAD_LETTER, terminal, no further leases | P2A-017 | TODO |
| P2C-012 | Idempotent duplicate delivery: executor side effect fires exactly once across retries | P2A-018 | TODO |
| P2C-013 | Cancellation before execution: PENDING/READY → CANCELLED cleanly | P2A-019 | TODO |
| P2C-014 | Cancellation during execution: running attempt tombstoned; no further transitions | P2A-019 | TODO |
| P2C-015 | Failed prerequisite (DEAD_LETTER) → dependent CANCELLED | P2A-019 | TODO |
| P2C-016 | Mission-run aggregation: mission_run reaches COMPLETED iff every task_run is terminal-success | P2A-020 | TODO |
| P2C-017 | Cross-tenant worker isolation: worker from Org A cannot claim Org B's READY task_run (RLS + policy) | P2A-014 | TODO |
| P2C-018 | Fresh DB → migrate → execute full deterministic DAG → COMPLETED with complete evidence chain | P2A-100 + P2B-001 | TODO |
| P2C-019 | Process restart with unfinished mission_run: state fully recovered from DB; execution resumes | P2A-100 | TODO |
| P2C-020 | **Acceptance test.** Kill Worker A after it leases `compile-a`; wait for lease expiry; Worker B reclaims; DAG completes; `publish` runs exactly once; evidence chain intact. Then restart the runtime and prove the same persisted mission still has the correct result. | ALL above | TODO |

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
