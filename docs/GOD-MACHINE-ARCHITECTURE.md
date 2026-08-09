# GOD Machine — Architecture

**Status:** Phase 0 architecture. This document is the source of truth for how
the system is designed. Implementation is tracked in
[`BUILD-TRACKER.md`](BUILD-TRACKER.md). Where implementation diverges from this
document, either the code is wrong or this document is wrong — resolve the
divergence explicitly, don't leave both.

---

## 1. Product primitives

Six primitives, and only six, describe the system:

| Primitive | Definition |
|-----------|------------|
| **Agent** | An intelligence that decides. Bound to a role, tools, model policy, permissions, budget. |
| **Tool**  | A capability that acts. Contract-typed, permissioned, sandboxed, audited. |
| **Worker**| A durable process that continues without a live UI session. |
| **Node**  | A machine that executes work. Local, cloud, or edge. |
| **Mission**| A desired outcome, with acceptance criteria and evidence. |
| **Evidence**| Proof that the outcome actually occurred (tests, logs, artifacts, health). |

The single fundamental equation:

```
MISSION = AGENTS + TOOLS + WORKERS + NODES + POLICIES + EVIDENCE
```

Anything that is not one of the above is derived from these six.

---

## 2. Execution chain

Every unit of user intent flows through the same chain. This is not
aspirational — the code must enforce this ordering.

```
USER INTENT
  → SPECIFICATION
    → PLAN
      → MISSION DAG
        → AGENT SWARM
          → MODEL ROUTING
            → TOOLS
              → GOD CLAW
                → SANDBOX
                  → EXECUTION
                    → TESTING
                      → SECURITY
                        → P99 VERIFICATION
                          → DEPLOYMENT
                            → OBSERVABILITY
                              → DIAGNOSIS (on failure)
                                → REPAIR
                                  ↺
```

An agent that reaches into the filesystem without going through GOD CLAW is a
bug. A tool call that reaches production without a P99 report is a bug. A
deployment that lacks post-deployment evidence is a bug. These are testable
invariants.

---

## 3. Kernel components

### 3.1 GOD Machine

The sovereign runtime. Owns mission lifecycle, workspaces, projects,
repositories, agent orchestration, tool execution, model access, sandbox
allocation, identity, policy, event streaming, artifact management,
deployments, recovery.

### 3.2 GOD Mode

Maximum-autonomy operating mode. Autonomy is a **level**, not a switch:

| Level | Meaning |
|-------|---------|
| ASK | Model proposes actions. Nothing runs without approval. |
| ASSIST | Safe reversible edits (file writes within workspace scope, formatter runs) may auto-execute. |
| EXECUTE | Approved-in-mission tool calls run without per-call approval. |
| AUTONOMOUS | Policy-compliant mission execution continues unattended, including approvals classified as low risk by the Guardian. |
| P99 | Same as AUTONOMOUS but P99 verification gates are mandatory before any `VERIFIED` state. |

Autonomy applies **to the mission**, not globally. A user with an ASSIST
default can promote a specific mission to AUTONOMOUS.

### 3.3 GOD Brain

Reasoning and orchestration plane. Distinct modules:

- **Intent Compiler** — natural language → structured intent.
- **Specification Generator** — intent → acceptance criteria + constraints.
- **Planner / Decomposer** — spec → task DAG.
- **Context Builder** — pulls the minimum useful context per task from the Context Engine.
- **Agent Selector** — matches task to agent role.
- **Model Selector** — passes the task to GOD Router; does not itself pick providers.
- **Tool Selector** — resolves symbolic tool requests to concrete tools + permissions.
- **Critic / Reviewer / Judge** — post-hoc verification loops.
- **Budget Controller** — enforces per-mission caps on cost, tokens, time, agents, tool calls.
- **Reflection Engine** — writes learnings back to GOD Memory.
- **Mission State Controller** — owns the persisted mission state machine.

Mission state is persisted, not held in prompt history.

### 3.4 GOD Claw

Execution authority. **No agent talks directly to the filesystem, terminal,
Git, browser, HTTP, database, Docker, SSH, Kubernetes, cloud APIs,
deployment providers, or package managers.** All of these flow through GOD Claw.

Enforced request path:

```
AGENT
  → TOOL REQUEST (typed, schema-validated)
    → GOD CLAW
      → POLICY ENGINE (Guardian)
        → RISK CLASSIFICATION
          → APPROVE | DENY | HUMAN APPROVAL
            → SANDBOX ALLOCATION
              → EXECUTION
                → OUTPUT CAPTURE
                  → EVIDENCE PERSISTENCE
                    → AUDIT LOG
```

Every step is auditable and reproducible.

### 3.5 GOD Router

Universal model routing. Providers are plugins. The system is **not** bound to
any single vendor.

Router inputs per decision:

- Task type (edit, plan, review, browse, structured extraction, etc.)
- Complexity signal
- Privacy class of the data
- Context size required
- Latency target
- Price ceiling
- Tool-calling / structured-output requirements
- Historical success rate for `(task_type, model)` from telemetry
- Organization policy (allowed / denied providers)
- Node availability (for local models)

Scoring model (implementation is a function, not a heuristic buried in prompts):

```
score = (quality * task_fit * reliability * tool_calling * context_fit * privacy_score)
      / (cost * latency * failure_probability)
```

User modes: `FREE`, `PRIVATE`, `BALANCED`, `FAST`, `QUALITY`, `P99`. Each mode
weights the scoring differently and constrains the candidate set.

`FREE` preference order:

```
LOCAL → USER EDGE NODE → FREE PROVIDER → CHEAPEST QUALIFIED PROVIDER → STOP
```

`FREE` never silently escalates to a paid provider. If no free option satisfies
the task, the router asks.

### 3.6 GOD Memory

Six memory layers, each with a distinct retention and retrieval strategy:

| Layer | Contents | Retention | Retrieval |
|-------|----------|-----------|-----------|
| L0 Task Context | Active turn | Per turn | Direct |
| L1 Mission Memory | Decisions, artifacts, evidence for a mission | Mission lifetime + archive | Mission-scoped retrieval |
| L2 Project Memory | Architecture, conventions, patch history | Project lifetime | Repo-scoped retrieval + graph |
| L3 Developer Memory | Personal preferences, communication style | User lifetime | User-scoped |
| L4 Organization Memory | Standards, policies, incident lessons | Org lifetime | Org-scoped |
| L5 Knowledge Memory | Vendor docs, external references | Indexed on demand | Semantic + full text |

Retrieval is **selective**, not "stuff everything in the prompt." A memory
that is not retrieved does not enter model context.

### 3.7 GOD Guardian

Security, policy, identity, human approval.

Risk categories: `READ`, `WRITE`, `EXECUTE`, `NETWORK`, `SECRET`,
`DEPLOYMENT`, `DESTRUCTIVE`, `FINANCIAL`, `EXTERNAL_COMMUNICATION`,
`PRIVILEGED`.

Approval workflows:

- **Per-call** — required for `DESTRUCTIVE`, `FINANCIAL`, `PRIVILEGED`, `EXTERNAL_COMMUNICATION` at all autonomy levels.
- **Per-mission** — one-time approval covers subsequent calls of the same class within the mission.
- **Standing** — org policy that permits or denies without prompting.

Secrets are never rendered into model prompts. Tools that need a secret receive
a **credential handle**, and the credential broker resolves it inside the
sandbox at execution time.

### 3.8 P99

P99 is a verification engine, not a marketing claim.

Per project, a `p99` config declares required gates. A mission cannot enter the
`VERIFIED` state until every required gate reports evidence-backed success.

Gates (a superset — projects opt in):

```
build, lint, format, typecheck,
unit_tests, integration_tests, contract_tests, e2e_tests,
browser_validation, visual_regression, accessibility,
dependency_audit, secret_scan, sast, container_scan, iac_scan,
api_contract, migration_check,
acceptance_criteria, performance_budget,
independent_code_review, security_review,
deployment_health, rollback_readiness
```

Each gate produces a typed evidence artifact. The P99 report aggregates
artifacts and computes a confidence score. **Confidence is derived from
evidence; it is never a free-standing number.**

---

## 4. Data model (Phase 0 outline)

Entities that must exist before any Phase 1 code lands. Full schemas are in
[`packages/schemas`](../packages/schemas). Key relations:

```
User ─┬─ Membership ── Organization ─┬─ Project ─┬─ Repository
      │                              │           ├─ Mission ─┬─ Task ─── TaskDependency
      │                              │           │           ├─ AgentRun
      │                              │           │           ├─ ToolRun
      │                              │           │           ├─ ModelRun
      │                              │           │           ├─ Approval
      │                              │           │           ├─ Artifact
      │                              │           │           └─ P99Report
      │                              ├─ Secret
      │                              ├─ Policy
      │                              └─ Node
      └─ Session
```

Every state-changing operation emits a typed `DomainEvent` persisted in an
append-only `audit_events` table. See ADR-0005.

---

## 5. Failure model

The platform is a distributed system. It fails. The design must acknowledge:

| Failure | Response |
|---------|----------|
| Provider unavailable | Router fallback, then user prompt |
| Agent crash | Task marked FAILED; mission decides retry per policy |
| Tool timeout | Configurable retry with backoff; escalate to approval on repeated failure |
| Sandbox death | Sandbox recreated from persisted state |
| Server restart | Missions resume from last checkpoint |
| Deployment fails health check | Automatic rollback if `rollback_readiness` passed |
| Network partition | Local operation continues; remote effects queued |

No component may assume the next component is healthy.

---

## 6. Sandboxing

Sandbox is an abstraction. Concrete implementations, in ascending isolation:

1. **Local process** with cgroups + seccomp (dev only).
2. **Docker** with restricted capabilities, read-only rootfs, dropped syscalls.
3. **Firecracker microVM** for hostile-code execution.
4. **Kubernetes namespace + NetworkPolicy** for production shared clusters.
5. **WASM/WASI** for deterministic, portable, low-privilege operations.

Every sandbox receives only the files, credentials, network egress rules, and
runtime it requires. Root-by-default is prohibited.

---

## 7. Nodes

Nodes are trust-tiered. A node's tier determines what missions may run on it.

| Tier | Data allowed |
|------|--------------|
| `UNVERIFIED` | Ephemeral public jobs only |
| `TRUSTED_PERSONAL` | Owner's own projects |
| `TRUSTED_ORGANIZATION` | Organization projects |
| `COMMUNITY` | Public, non-sensitive |
| `QUARANTINED` | Nothing |

Private repositories are never scheduled to untrusted nodes.

---

## 8. What this document does not commit to

Deliberately deferred to later ADRs so Phase 0 doesn't overpromise:

- Exact ORM choice (see ADR-0004: Postgres is committed; the ORM is not).
- Exact queue implementation for the worker runtime (Postgres-backed vs Redis Streams vs NATS JetStream).
- Exact sandbox implementation the reference deployment ships with.
- Rust vs TS split for the agent runtime (a decision that must land before Phase 6).
- The Web3 settlement layer — optional, may never ship. Not on the critical path.

Each of these is a real open question. None of them block Phase 1.

---

## 9. Anti-goals

Things GOD Machine is deliberately **not**:

- A single-vendor AI product. Providers are pluggable; none is required.
- A chatbot with a code editor. Chat is a UI affordance; the runtime is the product.
- A hosted-only service. Self-hosting is a first-class deployment target.
- A marketing surface pretending capabilities exist that don't. See the tracker.
