<!--
===============================================================================
THE OMNIPOTENT G.O.D MACHINE
Repository: The-Omnipotent-G.O.D-Machine-
Platform:   CodingAgent.in
===============================================================================
-->

<p align="center">
  <img
    width="1672"
    alt="The Omnipotent GOD Machine — Open Agentic Development OS"
    src="https://github.com/user-attachments/assets/d48e0bd5-dc88-4e82-bbcf-97c294e735d1"
  />
</p>

<div align="center">

# THE OMNIPOTENT G.O.D MACHINE

## Open-Source AI Coding Agent & Agentic Development OS

### Reason. Plan. Code. Execute. Verify. Deploy. Observe. Repair.

**G.O.D = Generative Omnipotent Development**

An open, self-hostable development runtime for autonomous coding agents,
multi-agent engineering swarms, MCP tools, local and cloud LLMs,
secure execution, persistent memory, deployment automation,
and evidence-driven **P99** verification.

<br />

**Local-First · Self-Hosted · Model-Agnostic · Multi-Agent · MCP-Native · Sovereign**

<br />

[Website](https://codingagent.in/god)
·
[Documentation](docs/GOD-MACHINE-ARCHITECTURE.md)
·
[Build Tracker](docs/BUILD-TRACKER.md)
·
[Self-Hosting](#self-hosting)
·
[Architecture](#recommended-architecture)
·
[Security](SECURITY.md)
·
[Contributing](CONTRIBUTING.md)

</div>

<p align="center">
  <img
    width="1916"
    alt="GOD Machine — architecture overview"
    src="https://github.com/user-attachments/assets/967c16fc-c561-4cb7-ad40-ed6788685e6f"
  />
</p>

---

> ### 🚧 Current status — Phase 0
>
> This repository is under active initial construction. **No production
> capabilities are claimed.** Every subsystem's real status lives in
> [`docs/BUILD-TRACKER.md`](docs/BUILD-TRACKER.md). If it is not marked
> `VERIFIED` there, it is not production-ready.
>
> This README describes the architecture and the destination — not what
> works today. The [status legend](#development-status-legend) applies
> throughout.

---

# What is GOD Machine?

**The Omnipotent G.O.D Machine** is the open-source engine behind
**CodingAgent / GOD**.

It is designed as an **Agentic Development Operating System** where autonomous
software-engineering agents can reason about a goal, construct an execution
plan, collaborate as specialist swarms, use approved tools, modify code,
execute tests, verify results, deploy applications, observe production systems,
and initiate controlled repair workflows.

GOD Machine is **not** intended to be just another AI chat sidebar or code
autocomplete extension.

The architecture treats development as an autonomous engineering loop:

```text
Intent
  ↓
Specification
  ↓
Plan
  ↓
Agent DAG
  ↓
Model Selection
  ↓
Tool Selection
  ↓
Secure Execution
  ↓
Tests
  ↓
Security
  ↓
Verification
  ↓
Deployment
  ↓
Observation
  ↓
Repair
  ↺
```

The long-term goal is one sovereign runtime connecting:

```text
Reasoning + Agents + Models + Memory + MCP Tools +
Secure Sandboxes + Workers + Distributed Compute +
Verification + Deployment
```

---

# Why GOD Machine?

Most AI development products center the workflow around one hosted model,
one vendor-controlled agent, or one IDE. GOD Machine takes a different
architectural approach.

```text
                    CODINGAGENT / GOD
                           │
                           ▼
                    ┌──────────────┐
                    │ GOD MACHINE  │
                    └──────┬───────┘
                           │
       ┌───────────────────┼────────────────────┐
       ▼                   ▼                    ▼
   GOD BRAIN           GOD SWARM           GOD ROUTER
   Intelligence        Agent Runtime       Model Runtime
       │                   │                    │
       └───────────────────┼────────────────────┘
                           ▼
                      GOD CLAW
                  Execution Authority
                           │
                           ▼
                     GOD GUARDIAN
                 Security / Policy Plane
                           │
                           ▼
                     GOD SANDBOX
                  Isolated Execution
                           │
          ┌────────────────┼─────────────────┐
          ▼                ▼                 ▼
        CODE             TESTS            DEPLOY
          └────────────────┼─────────────────┘
                           ▼
                          P99
                  Verification + Evidence
                           │
                           ▼
                   OBSERVE → REPAIR
```

The architecture makes the underlying model **replaceable infrastructure**
rather than the product itself.

---

# Core Principles

| Principle             | Meaning                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Open Source**       | Core runtime architecture is inspectable, forkable and extensible.                                            |
| **Self-Hosted**       | GOD Machine is operable without a mandatory hosted CodingAgent account.                                       |
| **Local-First**       | Sensitive source code and context can remain on infrastructure the user controls.                             |
| **Model-Agnostic**    | Agents do not depend permanently on one LLM provider.                                                         |
| **Free-First**        | GOD Router prefers eligible local and zero-cost routes when policy and capability allow.                      |
| **Multi-Agent**       | Specialist agents collaborate instead of forcing every task through one general-purpose agent.                |
| **Tool-Native**       | Filesystems, Git, terminals, browsers, APIs, databases and MCP capabilities are first-class runtime concepts. |
| **Policy-Controlled** | Models request actions; policy determines whether those actions may execute.                                  |
| **Sandbox-First**     | Autonomous execution occurs inside isolated environments whenever possible.                                   |
| **Evidence-Driven**   | Completion is based on observable test and verification evidence rather than model confidence alone.          |
| **Sovereign**         | Users control their models, memory, code, policies and infrastructure.                                        |

---

# GOD Machine Components

## GOD Agent

**GOD Agent** is the primary autonomous software-engineering interface.

A mission might look like:

```text
Inspect this repository.
Add a production-ready /health endpoint.
Update the tests.
Run the test suite.
Review the implementation for security regressions.
Show me the diff and verification evidence.
```

GOD Agent passes the mission into the broader GOD Machine rather than
attempting unrestricted execution directly.

---

## GOD Mode

<p align="center">
  <img
    width="1672"
    alt="GOD Mode — highest-autonomy operating mode"
    src="https://github.com/user-attachments/assets/9b81052a-fae1-41da-a220-cbdf5f66d7c5"
  />
</p>

**GOD Mode** is the highest-autonomy operating mode. It is intended for
missions such as:

```text
Build a production-ready application.

Design the architecture.
Implement the frontend and backend.
Create the database schema.
Write tests.
Perform security checks.
Deploy it.
Observe the deployment.
Repair verified failures.
```

High autonomy does **not** mean unlimited machine authority. Risky, privileged,
destructive, financial, secret-related or externally visible actions can still
require explicit approval — see [ADR-0003](docs/adr/0003-god-claw-execution-boundary.md).

---

## GOD Brain

<p align="center">
  <img
    width="1672"
    alt="GOD Brain — reasoning and orchestration"
    src="https://github.com/user-attachments/assets/a7c77483-56a1-4ef0-87ca-510855cc074c"
  />
</p>

**GOD Brain** is the reasoning, planning and orchestration layer.

```text
god-brain/
├── intent/
├── specification/
├── planner/
├── decomposer/
├── context-builder/
├── agent-selector/
├── model-selector/
├── tool-selector/
├── critic/
├── reviewer/
├── judge/
├── verifier/
├── policy/
├── budget/
├── memory/
└── learning/
```

GOD Brain answers questions such as:

- What does the user actually want?
- What constitutes completion?
- Which tasks can run in parallel?
- Which dependencies exist?
- Which agent should execute each task?
- Which model is suitable?
- Which tools are necessary?
- What context should be loaded?
- What actions require approval?
- Which sandbox should execute the task?
- What verification evidence is required?

The intended result is a persistent **mission DAG** rather than an
unstructured loop of model prompts. Full data model in
[ADR-0005](docs/adr/0005-mission-and-event-model.md).

---

## GOD Swarm

<p align="center">
  <img
    width="1672"
    alt="GOD Swarm — multi-agent engineering runtime"
    src="https://github.com/user-attachments/assets/6729a155-a82d-46ce-ae15-3fac256e05d8"
  />
</p>

**GOD Swarm** is the multi-agent engineering runtime.

A default engineering swarm contains specialist roles such as:

```text
Oracle / Research    Architect    Planner    Coder
Frontend             Backend      Database   Security
QA                   Browser      DevOps     SRE
Performance          Reviewer     Documentation
Critic               Judge        Guardian
```

Each agent has an explicit role, capabilities, allowed tools, permissions,
model policy, context scope, memory scope, budget, timeout, retry policy and
delegation policy — see [`packages/schemas/src/agent.ts`](packages/schemas/src/agent.ts).

Agents work concurrently when mission dependencies allow it:

```text
                    BUILD APPLICATION
                           │
                  ┌────────┴────────┐
                  ▼                 ▼
              Research        Architecture
                                    │
                         ┌──────────┼──────────┐
                         ▼          ▼          ▼
                     Database    Backend    Frontend
                         │          │          │
                         └──────────┼──────────┘
                                    ▼
                                  Tests
                                    ▼
                                Security
                                    ▼
                                  Review
                                    ▼
                                   P99
                                    ▼
                                 Deploy
```

---

## GOD Router

<p align="center">
  <img
    width="1672"
    alt="GOD Router — model-intelligence layer"
    src="https://github.com/user-attachments/assets/888cf2c4-ff4c-43e9-96b0-764acfb2e818"
  />
</p>

**GOD Router** is the model-intelligence layer. Instead of hardcoding
`Agent → One Model Provider`, the target architecture is:

```text
Request
   ↓
Classify → Policy Filter → Capability Filter → Health Check
   ↓
Score Candidates → Select Route → Execute → Validate
   ↓
Fallback if Required
```

Routing considers task type, complexity, privacy requirements, context length,
tool-calling support, structured-output support, latency, availability,
reliability, historical task performance, budget and user policy.

Potential runtime classes:

```text
LOCAL                      EDGE                       CLOUD
├── Ollama                 ├── Trusted LAN nodes      ├── Configured zero-cost quotas
├── llama.cpp              ├── Organization nodes     ├── User-configured providers
├── vLLM                   └── CodingAgent EdgeNodes  └── Premium providers
├── SGLang
└── OpenAI-compatible local servers
```

Virtual aliases provide stable interfaces:

```text
god/auto      god/free       god/private       god/fast
god/coding    god/reasoning  god/long-context  god/quality   god/p99
```

Free-first policy:

```text
LOCAL ↓ TRUSTED LAN ↓ USER EDGE ↓ CONFIGURED ZERO-COST ROUTE
      ↓ LOW-COST ALLOWED PROVIDER ↓ PREMIUM PROVIDER
```

Full router design in [ADR-0002](docs/adr/0002-model-router-abstraction.md).

---

## GOD Memory

<p align="center">
  <img
    width="1672"
    alt="GOD Memory — persistent engineering intelligence"
    src="https://github.com/user-attachments/assets/eeecf5f6-7d28-42fe-94e2-eeb98c180a27"
  />
</p>

**GOD Memory** provides persistent engineering intelligence across six layers:

```text
L0 — Active Context          current execution context
L1 — Mission Memory          intent, requirements, task state and results
L2 — Project Memory          architecture, repository facts, decisions
L3 — Developer Memory        explicit developer preferences and conventions
L4 — Organization Memory     approved engineering standards and policies
L5 — Knowledge Memory        documentation and indexed knowledge
```

Memory is scoped, searchable, version-aware, exportable, policy-controlled,
privacy-aware and evidence-backed. Storage primitives: **PostgreSQL, pgvector,
Git, object storage, knowledge graph** — see
[ADR-0004](docs/adr/0004-storage-postgres-pgvector.md).

---

## GOD Context Engine

Large repositories should not be blindly inserted into an LLM context window.
The context engine builds relevant context from:

```text
Filesystem + AST + Symbol Graph + Import Graph + Dependency Graph +
Git History + Semantic Search + Documentation + Tests + Runtime Traces +
Issues + Mission History
```

Objective:

> Retrieve the smallest sufficient context required to complete the current
> engineering task.

---

## GOD Claw

<p align="center">
  <img
    width="1672"
    alt="GOD Claw — controlled action and execution authority"
    src="https://github.com/user-attachments/assets/82bec0dc-0d61-471e-a18e-911e46b9078b"
  />
</p>

**GOD Claw** is the controlled action and execution authority.

> **Brain thinks. Swarm collaborates. Claw acts.**

Target capabilities include filesystem read/write/patch/search, Git
status/diff/branch/checkout/commit, shell / tests / package management / build
commands, MCP / HTTP / APIs / databases / browser automation, Docker /
Kubernetes / SSH / deployment / rollback.

**The security boundary is critical.** Agents do not receive unrestricted
machine access simply because a model requested an action. The enforced flow:

```text
Agent → Tool Request → GOD Claw → GOD Guardian
      → Policy Evaluation → Risk Classification
      → Allow / Deny / Approval Required
      → Sandbox → Execution → Output → Evidence → Audit Record
```

Full design in [ADR-0003](docs/adr/0003-god-claw-execution-boundary.md).

---

## GOD Guardian

**GOD Guardian** is the security, permissions and policy plane.

Risk classes: `READ`, `WRITE`, `EXECUTE`, `NETWORK`, `SECRET`,
`EXTERNAL_COMMUNICATION`, `FINANCIAL`, `DEPLOYMENT`, `DESTRUCTIVE`,
`PRIVILEGED`.

Policy outcomes: `ALLOW`, `DENY`, `APPROVAL_REQUIRED`.

Responsibilities: permission enforcement, secret protection, filesystem
scopes, network egress policy, destructive-command detection, prompt-injection
defense, dependency trust, MCP permissions, supply-chain scanning, code
scanning, audit logging, human approval escalation.

Untrusted repository content, webpages, documentation or tool output must
**not** be able to override system, organization, mission or user policy.
See the full [Threat Model](docs/THREAT-MODEL.md).

---

## GOD Sandbox

Autonomous execution is isolated. Potential sandbox backends: Docker, gVisor,
Firecracker, WASM/WASI, Kubernetes namespaces, virtual machines, trusted
EdgeNode runtimes.

Each execution receives only what the mission requires:

```text
Required files   Required commands   Required network access
Required credentials   Required compute   Required runtime
```

Default execution never requires unrestricted root access.

---

# MCP-Native Tool Fabric

GOD Machine treats external capabilities as typed tools. Supported surfaces:
**MCP, HTTP, OpenAPI, GraphQL, CLI, SDK, SSH, Browser, Webhooks, Databases,
Cloud APIs.**

Normalized tool definition: `id, version, name, description, input schema,
output schema, permissions, risk class, timeout, retry policy, credential
requirements, sandbox policy` — see
[`packages/schemas/src/tool.ts`](packages/schemas/src/tool.ts).

Agents discover capabilities without bypassing security controls.

---

# Agentic IDE

GOD Machine is broader than an IDE, but an **Agentic IDE** is one of its
primary interfaces.

```text
┌─────────────────────────────────────────────────────────────┐
│ GOD MODE   Project ▼   Agents   Models   Mission   P99      │
├─────────────┬──────────────────────────────┬────────────────┤
│             │                              │                │
│ FILE TREE   │            EDITOR            │   GOD BRAIN    │
│             │                              │                │
│ src/        │                              │ Architect      │
│ apps/       │                              │ Builder        │
│ packages/   │                              │ Security       │
│ infra/      │                              │ Reviewer       │
│             │                              │ Tester         │
├─────────────┴──────────────────────────────┴────────────────┤
│ AGENT SWARM                                                 │
│ ● Architect ● Frontend ● Backend ● DB ● Security ● QA       │
├─────────────────────────────────────────────────────────────┤
│ TERMINAL │ BROWSER │ TESTS │ GIT │ MCP │ DEPLOY │ LOGS      │
└─────────────────────────────────────────────────────────────┘
```

The IDE is one interface into the larger GOD Machine runtime rather than the
product itself.

---

# P99 Verification

**P99 is an evidence and verification system.** It does **not** mean an AI
model is magically "99% correct."

A mission may define required gates such as:

```text
Build            Typecheck        Lint             Unit tests
Integration      Contract         End-to-end       Browser
Visual           Accessibility    Security scan    Dependency scan
Secret scan      Container scan   Performance      Acceptance criteria
Independent review                Deployment health
```

Example report:

```text
P99 VERIFICATION REPORT
Mission:        Add production health endpoint
Commit:         abc123
Artifact:       sha256:…

Build:                 PASS
Typecheck:             PASS
Unit Tests:            142 / 142 PASS
Integration Tests:      28 /  28 PASS
Security Critical:     0
Security High:         0
Acceptance Criteria:   PASS
Independent Review:    PASS
Deployment Health:     PASS

Status:                VERIFIED
```

**Evidence is attached to every claim.** No gate is reported as passed unless
the corresponding check actually ran.

---

# Self-Healing Engineering

Controlled repair loops:

```text
Production Signal → Incident → GOD SRE → Collect Evidence → Reproduce
  → Root Cause → Generate Patch → Sandbox → Tests → Security → P99
  → Approval Policy → Canary → Observe → Promote
      └── degraded ── Rollback
```

Autonomy policies: `OFF`, `PROPOSE`, `TEST`, `CANARY`, `AUTONOMOUS_LOW_RISK`.

---

# Mission Runtime

Every significant request becomes a durable mission. States:

```text
PENDING  BLOCKED  READY  RUNNING  WAITING_APPROVAL
RETRYING FAILED   COMPLETED  VERIFIED  CANCELLED
```

Mission state survives process restarts. Durable background processing uses an
actual queue or workflow runtime — not an in-memory task array.

---

# EdgeNode Compute

Any machine can become a capability node — developer laptop, gaming PC,
workstation, Mac mini, homelab server, VPS, GPU server, enterprise cluster.

Nodes advertise: `CPU, GPU, RAM, Storage, Models, Container support, Browser
capability, Region, Latency, Trust level, Availability, Supported workloads`.

Trust levels: `PERSONAL`, `ORGANIZATION`, `COMMUNITY`, `QUARANTINED`.

**Sensitive data is not automatically routed to untrusted nodes.**

---

# Deploy Anywhere

Targets include: local machine, homelab, bare metal, VPS, Docker, Kubernetes,
Vercel, Cloudflare, AWS, other cloud providers, EdgeNode infrastructure.

---

# Recommended Architecture

```text
                        CODINGAGENT.IN
                              │
                              ▼
                        GOD MACHINE
                              │
            ┌─────────────────┴──────────────────┐
            ▼                                    ▼
       GOD MACHINE UI                     GOD MACHINE API
            │                                    │
            └─────────────────┬──────────────────┘
                              ▼
                         MISSION ENGINE
                              │
                         GOD BRAIN
                              │
             ┌────────────────┼─────────────────┐
             ▼                ▼                 ▼
         GOD SWARM       GOD ROUTER        GOD MEMORY
             │                │                 │
             └────────────────┼─────────────────┘
                              ▼
                          GOD CLAW
                              │
                         GOD GUARDIAN
                              │
                         GOD SANDBOX
                              │
                    MCP / TOOL FABRIC
                              │
        ┌─────────────────────┼──────────────────────┐
        ▼                     ▼                      ▼
      LOCAL                 CLOUD                  EDGE
                              │
                              ▼
                            P99
                              │
                              ▼
                         DEPLOYMENT
                              │
                              ▼
                        OBSERVABILITY
                              │
                              ▼
                           REPAIR
```

---

# Repository Structure

Current tree (Phase 0):

```text
The-Omnipotent-G.O.D-Machine-/
├── apps/
│   └── web/                    Next.js — /, /god, /api/health   🚧
├── packages/
│   └── schemas/                Zod: Mission, Task, Agent, Tool, Event   🧪
├── infrastructure/
│   └── compose/                Postgres+pgvector, Redis, MinIO for dev  🧪
├── docs/
│   ├── GOD-MACHINE-ARCHITECTURE.md
│   ├── BUILD-TRACKER.md
│   ├── THREAT-MODEL.md
│   └── adr/                    ADRs 0001–0005
├── .github/workflows/          CI: typecheck, build, docs
├── README.md
├── SECURITY.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── LICENSE                     Apache-2.0
```

Target tree (as phases land — see [`docs/BUILD-TRACKER.md`](docs/BUILD-TRACKER.md)):

```text
├── apps/            web · ide · desktop · cli · docs
├── services/        identity · mission · brain · router · claw · sandbox-manager
│                    agent-runtime · worker-runtime · mcp-gateway · deployment
│                    p99-engine · node-scheduler · memory · observability · api-gateway
├── packages/        agent-sdk · tool-sdk · model-sdk · workflow-sdk · node-sdk
│                    ui · schemas · security-sdk · config · telemetry
├── infrastructure/  docker · compose · kubernetes · helm · terraform
├── docs/            adr/ · guides/ · security/ · self-hosting/
├── examples/  tests/  benchmarks/
```

---

# Technology Direction

```text
Frontend                    React / Next.js · TypeScript · Monaco · xterm.js
Desktop                     Tauri
Local runtime / security    Rust
AI / eval / support         TypeScript · Python where appropriate
Database                    PostgreSQL
Vector search               pgvector
Queue / cache               Redis
Object storage              MinIO / S3-compatible
Containers                  Docker
Browser automation          Playwright
Observability               OpenTelemetry · Prometheus-compatible metrics
Orchestration               Docker Compose first · Kubernetes / Helm later
```

Language-split rationale in [ADR-0001](docs/adr/0001-monorepo-and-language.md).

---

# Quick Start

> **What works today (Phase 0):** the Next.js web app renders `/` and `/god`,
> a `/api/health` endpoint reports liveness, and the dev compose brings up
> Postgres, Redis and MinIO. **Nothing else runs yet** — everything mission-,
> agent-, router-, claw- or deploy-related is scheduled in the tracker.

Requirements: Node 20+, pnpm 9+, Docker.

```bash
git clone https://github.com/CodesbyFebin/The-Omnipotent-G.O.D-Machine-.git
cd The-Omnipotent-G.O.D-Machine-

pnpm install
cp .env.example .env

docker compose -f infrastructure/compose/dev.yml up -d
pnpm --filter @god/web dev
```

The planned one-command interface (📋 planned) is:

```bash
curl -fsSL https://codingagent.in/install | sh
codingagent god
```

These are part of the target architecture and marked experimental until
implemented (see `docs/BUILD-TRACKER.md`, tracker item `P14-004`).

---

# Self-Hosting

The self-hosting objective:

```bash
git clone https://github.com/CodesbyFebin/The-Omnipotent-G.O.D-Machine-.git
cd The-Omnipotent-G.O.D-Machine-
docker compose -f infrastructure/compose/dev.yml up -d
pnpm install && pnpm --filter @god/web dev
```

Target local endpoints (as they come online):

```text
GOD Machine UI      http://localhost:3000    🚧 Phase 0
GOD Router          http://localhost:8080/v1 📋 Phase 3
Postgres            localhost:5432           🧪
Redis               localhost:6379           🧪
MinIO console       http://localhost:9001    🧪
```

**No endpoint is documented as working until CI verifies it.**

---

# Local LLMs

GOD Router is designed around model independence. Example configuration
(schema will be finalized in Phase 3):

```yaml
models:
  private:
    provider: ollama
    model: local-coder

  coding:
    provider: auto

  reasoning:
    provider: auto

routing:
  default: god/auto
  private: god/private
  free_first: true
```

---

# OpenAI-Compatible Gateway

GOD Router (📋 Phase 3) will expose compatible endpoints where underlying
capabilities permit:

```text
GET  /v1/models
POST /v1/chat/completions
POST /v1/embeddings
```

Streaming is supported where providers allow it. **Compatibility is tested
rather than claimed globally.**

---

# Security

Security is a primary design requirement. The runtime follows:

```text
Zero trust                  Least privilege
Sandbox-first execution     Explicit network policy
Scoped filesystem access    Secret isolation
Credential brokering        Audit everything
No secrets in prompts       No secrets in frontend state
No unrestricted root        No tool access without policy evaluation
```

Report vulnerabilities privately — see [`SECURITY.md`](SECURITY.md). Full
threat model in [`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md).

**Do not** open public issues containing API keys, access tokens, private keys,
credentials, production exploit details, or private vulnerability reproduction
data.

---

# Privacy

> **Your code, your models, your memory, your infrastructure, your rules.**

A fully local configuration can operate without sending repository content to
third-party model providers. Network egress is explicit and observable.
Telemetry is opt-in rather than mandatory.

---

# Observability

Every meaningful autonomous action produces traceable evidence:

```text
Mission ID · Task ID · Agent · Model route · Tool
Permission decision · Sandbox · Execution duration
Token usage · Compute usage · Exit status
Verification result · Artifact hash · Deployment result · Retry history
```

Observability must not leak secrets or sensitive source content.

---

# API & SDK

Planned interfaces: REST API, WebSocket / event stream, CLI, TypeScript SDK,
Python SDK, Rust interfaces, MCP, Webhooks. Stable public APIs are versioned.
Contract types live in [`packages/schemas`](packages/schemas/src/index.ts).

---

# Status

## Important

GOD Machine is an ambitious systems project. The README distinguishes between:

```text
IMPLEMENTED    EXPERIMENTAL    PLANNED    RESEARCH
```

**Roadmap functionality is not described as production-ready.**

The following are **not** fabricated: benchmarks, latency, security audits,
test counts, user counts, node counts, provider availability, P99 reliability
percentages, production deployments. Every such claim must be backed by real
evidence.

## Development Status Legend

| Status          | Meaning                                      |
| --------------- | -------------------------------------------- |
| ✅ Stable        | Implemented, tested and supported            |
| 🧪 Experimental | Functional but API/behavior may change       |
| 🚧 In Progress  | Actively being developed                     |
| 📋 Planned      | Accepted architecture, not yet implemented   |
| 🔬 Research     | Exploratory work with no delivery commitment |

---

# Roadmap

| Phase | Focus                                            | Status |
| ----- | ------------------------------------------------ | ------ |
| 0     | Repo foundation · architecture · CI · security   | 🚧 In progress |
| 1     | Local GOD Machine vertical slice                 | 📋 |
| 2     | GOD Router + Ollama                              | 📋 |
| 3     | Mission runtime + persistence                    | 📋 |
| 4     | GOD Brain                                        | 📋 |
| 5     | GOD Claw + Guardian                              | 📋 |
| 6     | Docker sandbox                                   | 📋 |
| 7     | Agent Swarm                                      | 📋 |
| 8     | GOD Memory + Context Engine                      | 📋 |
| 9     | Agentic IDE                                      | 📋 |
| 10    | MCP capability fabric                            | 📋 |
| 11    | P99 verification                                 | 📋 |
| 12    | Deployment automation                            | 📋 |
| 13    | Observability + controlled repair                | 📋 |
| 14    | EdgeNode runtime                                 | 📋 |
| 15    | Distributed compute                              | 🔬 |

Per-item status is in [`docs/BUILD-TRACKER.md`](docs/BUILD-TRACKER.md).

---

# First Production Acceptance Test

The first meaningful vertical slice must prove that GOD Machine can operate
locally end-to-end:

```text
 1. Start GOD Machine locally.
 2. Connect a repository.
 3. Detect a local Ollama installation.
 4. Display installed models.
 5. Create mission: "Inspect this repository and add a /health endpoint."
 6. GOD Brain generates specification, task graph, acceptance criteria.
 7. Coding agent reads the repository.
 8. GOD Claw creates a controlled branch/change set.
 9. Tests execute inside the sandbox.
10. P99 records build/test evidence.
11. User receives git diff, test results, evidence, limitations.
12. No cloud model API is required.
```

Only after this vertical slice is reliable will broader autonomous claims be
promoted prominently.

---

# Philosophy

```text
AGENT   decides.
TOOL    acts.
WORKER  continues.
NODE    executes.
MISSION defines the outcome.
EVIDENCE proves what happened.
```

The fundamental GOD Machine equation:

```text
MISSION  =  AGENTS + TOOLS + WORKERS + NODES + POLICIES + EVIDENCE
```

---

# Use Cases

Autonomous feature development · repository understanding · code generation ·
bug fixing · code review · security review · test generation · browser
testing · dependency upgrades · migration work · DevOps · CI/CD ·
infrastructure changes · deployment · incident diagnosis · controlled
self-repair · multi-repository engineering · local/private AI development ·
enterprise self-hosting · distributed development compute.

---

# Who Is This For?

Software developers · AI engineers · platform engineers · DevOps engineers ·
SRE teams · security engineers · open-source maintainers · startups ·
AI-native engineering teams · enterprises requiring self-hosting · homelab
builders · local AI developers · agent framework developers · MCP developers.

---

# Frequently Asked Questions

**Is GOD Machine an AI coding agent?**
GOD Machine contains and coordinates AI coding agents, but the system itself
is broader than one agent. It provides orchestration, execution, security,
memory, model-routing, verification and deployment around those agents.

**What does G.O.D mean?**
**Generative Omnipotent Development.**

**Is GOD Machine an Agentic IDE?**
It includes an Agentic IDE, but GOD Machine is the underlying development
runtime. CLI, API, desktop, workers and other interfaces use the same core.

**Can GOD Machine run locally?**
Local-first and self-hosted operation are core architectural requirements.

**Does GOD Machine require OpenAI?**
No mandatory model provider is part of the architecture.

**Does GOD Machine support Ollama?**
Ollama is one of the intended local-model runtimes for GOD Router.

**What is GOD Router?**
It selects an appropriate model route based on capability, privacy,
availability, performance policy and budget.

**What is GOD Brain?**
It converts intent into specifications, plans, agent decisions, context,
model selection, execution tasks and verification requirements.

**What is GOD Claw?**
The controlled execution authority for filesystem, terminal, Git, browser,
API, database and infrastructure actions.

**What is GOD Swarm?**
The runtime that coordinates specialized engineering agents to collaborate
and execute independent tasks in parallel.

**What is GOD Memory?**
Scoped project, mission, developer, organization and knowledge context for
future retrieval.

**What is P99?**
The verification and evidence layer. It proves that defined engineering gates
passed. It is **not** a blanket claim of 99% AI correctness.

**Is GOD Machine fully autonomous?**
The architecture supports multiple autonomy levels. Sensitive, privileged or
irreversible actions can require approval.

**Does GOD Machine support MCP?**
MCP is a native capability and tool integration layer.

**Can GOD Machine deploy software?**
Deployment automation is part of the architecture, with policy controls,
verification and rollback expected around production changes.

**Can it repair production software automatically?**
Controlled observe-and-repair workflows are planned. Autonomous production
repair is enabled only under explicitly defined risk policies.

---

# Project Identity

```text
Project:             The Omnipotent G.O.D Machine
Abbreviation:        GOD Machine
G.O.D:               Generative Omnipotent Development
Platform:            CodingAgent
Website:             codingagent.in
Product Category:    Agentic Development Operating System
Primary Runtime:     GOD Machine
Autonomous Interface: GOD Mode / GOD Agent
Reasoning:           GOD Brain
Execution:           GOD Claw
Models:              GOD Router
Memory:              GOD Memory
Multi-Agent:         GOD Swarm
Security:            GOD Guardian
Isolation:           GOD Sandbox
Verification:        P99
```

---

# Search & Discovery Terms

This repository is relevant to developers researching:

`AI coding agent` · `open-source AI coding agent` · `autonomous coding agent` ·
`self-hosted coding agent` · `agentic IDE` · `open-source agentic IDE` ·
`AI software engineer` · `autonomous software engineering` · `multi-agent
coding` · `agent swarm coding` · `local LLM coding agent` · `Ollama coding
agent` · `MCP coding agent` · `Model Context Protocol` · `LLM router` ·
`self-hosted LLM gateway` · `secure AI agents` · `sandboxed coding agent` ·
`AI DevOps agent` · `autonomous development platform` · `agentic development
OS` · `sovereign AI development`.

For terminology clarity and repository discovery — not keyword stuffing.

---

# Repository Topics

Suggested GitHub topics (settable via **Settings → Topics** or `gh repo edit`):

```text
ai-coding-agent   coding-agent            autonomous-agent
autonomous-coding agentic-ai              agentic-ide
ai-code-editor    software-engineering    multi-agent
multi-agent-system ai-agents              mcp
model-context-protocol                    local-llm
ollama            llm-router              self-hosted
developer-tools   rust                    open-source
```

Repository description:

> Open-source AI coding agent and self-hosted Agentic Development OS with
> autonomous agent swarms, MCP tools, local LLM routing, secure sandboxes,
> persistent memory, coding IDE, P99 verification, deployment and
> self-healing workflows.

---

# Contributing

Contributions are welcome. Before contributing:

1. Read [`docs/GOD-MACHINE-ARCHITECTURE.md`](docs/GOD-MACHINE-ARCHITECTURE.md)
2. Read [`SECURITY.md`](SECURITY.md)
3. Search existing issues
4. Open an RFC for major architectural changes
5. Add tests
6. Update documentation
7. Keep security boundaries intact
8. Include evidence for behavior claims

**Please do not bypass Guardian, sandbox or verification controls merely to
make a demo appear more autonomous.**

Full guidelines in [`CONTRIBUTING.md`](CONTRIBUTING.md).

---

# Governance

Architecture-level decisions are documented publicly as ADRs in
[`docs/adr/`](docs/adr/). Major changes use RFCs covering: problem, motivation,
threat model, proposed architecture, alternatives, compatibility, migration,
testing, security impact, operational impact, rollout, rollback.

---

# License

**Apache-2.0.** See [`LICENSE`](LICENSE).

The project recommends Apache-2.0 for the core, SDK, CLI and EdgeNode
components, while keeping any future managed services separable.

---

# Citation

If you use GOD Machine in research, documentation or derivative work, citation
metadata will be published once the first stable public release exists.

---

# Responsible Claims

GOD Machine documentation follows a simple rule:

> **If the system cannot prove it happened, the documentation does not claim
> it happened.**

Every production claim is backed by source code, tests, CI results,
benchmarks, signed artifacts, security evidence, deployment evidence and
reproducible documentation.

---

<div align="center">

# THE OMNIPOTENT G.O.D MACHINE

### Open Agentic Development OS

**Think → Plan → Build → Execute → Verify → Deploy → Observe → Repair**

<br />

**Open Source · Self-Hosted · Local-First · Model-Agnostic · Sovereign**

<br />

[**CodingAgent.in / GOD →**](https://codingagent.in/god)

</div>
