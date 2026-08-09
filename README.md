# The-Omnipotent-G.O.D-Machine-

G.O.D Machine  Open Agentic Development OS  ✨G.O.D✨Open-source AI coding agent and self-hosted Agentic Development OS with autonomous agent swarms, MCP tools, local LLM routing, secure sandboxes, persistent memory, coding IDE, P99 verification, deployment and self-healing workflows.
<img width="1672" height="941" alt="God Claw" src="https://github.com/user-attachments/assets/82bec0dc-0d61-471e-a18e-911e46b9078b" />
<img width="1672" height="941" alt="God memory" src="https://github.com/user-attachments/assets/eeecf5f6-7d28-42fe-94e2-eeb98c180a27" />
<img width="1672" height="941" alt="God router" src="https://github.com/user-attachments/assets/888cf2c4-ff4c-43e9-96b0-764acfb2e818" />
<img width="1672" height="941" alt="God Swarm" src="https://github.com/user-attachments/assets/6729a155-a82d-46ce-ae15-3fac256e05d8" />
<img width="1672" height="941" alt="GOD BRAIN" src="https://github.com/user-attachments/assets/a7c77483-56a1-4ef0-87ca-510855cc074c" />

````markdown
<!--
===============================================================================
THE OMNIPOTENT G.O.D MACHINE
Repository: The-Omnipotent-G.O.D-Machine
Platform: CodingAgent.in
===============================================================================
-->

<div align="center">

# THE OMNIPOTENT G.O.D MACHINE

## Open-Source AI Coding Agent & Agentic Development OS

### Reason. Plan. Code. Execute. Verify. Deploy. Observe. Repair.

**G.O.D = Generative Omnipotent Development**

An open, self-hostable development runtime for autonomous coding agents,
multi-agent engineering swarms, MCP tools, local and cloud LLMs,
secure execution, persistent memory, deployment automation,
and evidence-driven P99 verification.

<br />

**Local-First · Self-Hosted · Model-Agnostic · Multi-Agent · MCP-Native · Sovereign**

<br />

[Website](https://codingagent.in/god)
·
[Documentation](https://codingagent.in/docs)
·
[Self-Hosting](#self-hosting)
·
[Architecture](#architecture)
·
[Security](#security)
·
[Contributing](#contributing)

</div>

---

<p align="center">
  <img
    src="./docs/assets/god-machine-hero.png"
    alt="The Omnipotent GOD Machine — Open Agentic Development OS for autonomous coding agents, agent swarms, MCP tools, local LLM routing, secure execution and P99 verification"
    width="100%"
  />
</p>

> **Asset note:** add the official repository hero image as
> `docs/assets/god-machine-hero.png`.

---

# What is GOD Machine?

**The Omnipotent G.O.D Machine** is the open-source engine behind
**CodingAgent / GOD**.

It is designed as an **Agentic Development Operating System** where autonomous
software-engineering agents can reason about a goal, construct an execution
plan, collaborate as specialist swarms, use approved tools, modify code,
execute tests, verify results, deploy applications, observe production systems,
and initiate controlled repair workflows.

GOD Machine is **not intended to be only another AI chat sidebar or code
autocomplete extension**.

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
````

The long-term goal is one sovereign runtime connecting:

```text
Reasoning
+
Agents
+
Models
+
Memory
+
MCP Tools
+
Secure Sandboxes
+
Workers
+
Distributed Compute
+
Verification
+
Deployment
```

---

# Why GOD Machine?

Most AI development products center the workflow around one hosted model,
one vendor-controlled agent, or one IDE.

GOD Machine takes a different architectural approach.

```text
                    CODINGAGENT / GOD

                           │
                           ▼

                    ┌──────────────┐
                    │ GOD MACHINE  │
                    └──────┬───────┘
                           │
       ┌───────────────────┼────────────────────┐
       │                   │                    │
       ▼                   ▼                    ▼

   GOD BRAIN           GOD SWARM           GOD ROUTER
   Intelligence        Agent Runtime        Model Runtime

       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
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

The architecture is intended to make the underlying model replaceable
infrastructure rather than the product itself.

---

# Core Principles

| Principle             | Meaning                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------- |
| **Open Source**       | Core runtime architecture should be inspectable, forkable and extensible.                                     |
| **Self-Hosted**       | GOD Machine should be operable without requiring a mandatory hosted CodingAgent account.                      |
| **Local-First**       | Sensitive source code and context should be able to remain on infrastructure controlled by the user.          |
| **Model-Agnostic**    | Agents should not depend permanently on one LLM provider.                                                     |
| **Free-First**        | GOD Router should prefer eligible local and zero-cost routes when policy and capability allow.                |
| **Multi-Agent**       | Specialist agents collaborate instead of forcing every task through one general-purpose agent.                |
| **Tool-Native**       | Filesystems, Git, terminals, browsers, APIs, databases and MCP capabilities are first-class runtime concepts. |
| **Policy-Controlled** | Models request actions; policy determines whether those actions may execute.                                  |
| **Sandbox-First**     | Autonomous execution should occur inside isolated environments whenever possible.                             |
| **Evidence-Driven**   | Completion should be based on observable test and verification evidence rather than model confidence alone.   |
| **Sovereign**         | Users should control their models, memory, code, policies and infrastructure.                                 |

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

**GOD Mode** is the highest-autonomy operating mode.

It is intended for missions such as:

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

High autonomy does **not** mean unlimited machine authority.

Risky, privileged, destructive, financial, secret-related or externally
visible actions can still require explicit approval.

---

# GOD Brain

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

GOD Brain is responsible for questions such as:

```text
What does the user actually want?

What constitutes completion?

Which tasks can run in parallel?

Which dependencies exist?

Which agent should execute each task?

Which model is suitable?

Which tools are necessary?

What context should be loaded?

What actions require approval?

Which sandbox should execute the task?

What verification evidence is required?
```

The intended result is a persistent **mission DAG** rather than an
unstructured loop of model prompts.

---

# GOD Swarm

**GOD Swarm** is the multi-agent engineering runtime.

A default engineering swarm can contain specialist roles such as:

```text
Oracle / Research
Architect
Planner
Coder
Frontend
Backend
Database
Security
QA
Browser
DevOps
SRE
Performance
Reviewer
Documentation
Critic
Judge
Guardian
```

Each agent should have explicit:

```text
Role
Capabilities
Allowed tools
Permissions
Model policy
Context scope
Memory scope
Budget
Timeout
Retry policy
Delegation policy
```

Agents may work concurrently when mission dependencies allow it.

Example:

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

# GOD Router

**GOD Router** is the model-intelligence layer.

Instead of hardcoding:

```text
Agent → One Model Provider
```

the target architecture is:

```text
Request
   ↓
Classify
   ↓
Policy Filter
   ↓
Capability Filter
   ↓
Health Check
   ↓
Score Candidates
   ↓
Select Route
   ↓
Execute
   ↓
Validate
   ↓
Fallback if Required
```

Routing can consider:

```text
Task type
Complexity
Privacy requirements
Context length
Tool-calling support
Structured-output support
Latency
Availability
Reliability
Historical task performance
Budget
User policy
```

Potential runtime classes include:

```text
LOCAL
├── Ollama
├── llama.cpp
├── vLLM
├── SGLang
└── OpenAI-compatible local servers

EDGE
├── Trusted LAN nodes
├── Organization nodes
└── CodingAgent EdgeNodes

CLOUD
├── Configured zero-cost quotas
├── User-configured providers
└── Premium providers
```

Virtual aliases can provide stable interfaces:

```text
god/auto
god/free
god/private
god/fast
god/coding
god/reasoning
god/long-context
god/quality
god/p99
```

A free-first policy should mean:

```text
LOCAL
  ↓ unavailable
TRUSTED LAN
  ↓
USER EDGE
  ↓
CONFIGURED ZERO-COST ROUTE
  ↓
LOW-COST ALLOWED PROVIDER
  ↓
PREMIUM PROVIDER
```

It should **not** assume that third-party cloud free tiers are permanent.

The proposed router architecture explicitly considers quality, task fit,
reliability, tool calling, context suitability, privacy, cost, latency and
failure probability. 

---

# GOD Memory

**GOD Memory** provides persistent engineering intelligence.

Recommended hierarchy:

```text
L0 — Active Context
Current execution context

L1 — Mission Memory
Intent, requirements, task state and results

L2 — Project Memory
Architecture, repository facts and technical decisions

L3 — Developer Memory
Explicit developer preferences and workflow conventions

L4 — Organization Memory
Approved engineering standards and policies

L5 — Knowledge Memory
Documentation and indexed knowledge
```

Memory should be:

```text
Scoped
Searchable
Version-aware
Exportable
Policy-controlled
Privacy-aware
Evidence-backed
```

Possible storage primitives:

```text
PostgreSQL
pgvector
Git
Object storage
Knowledge graph
```

The design includes persistent cross-session memory, project/global tiers,
local vector storage, snapshot export/import, pruning and encrypted storage
as planned capabilities. 

---

# GOD Context Engine

Large repositories should not be blindly inserted into an LLM context window.

The context engine should build relevant context from:

```text
Filesystem
+
AST
+
Symbol Graph
+
Import Graph
+
Dependency Graph
+
Git History
+
Semantic Search
+
Documentation
+
Tests
+
Runtime Traces
+
Issues
+
Mission History
```

The objective is:

> Retrieve the smallest sufficient context required to complete the current
> engineering task.

---

# GOD Claw

**GOD Claw** is the controlled action and execution authority.

> **Brain thinks. Swarm collaborates. Claw acts.**

Target capabilities include:

```text
Filesystem
├── read
├── write
├── patch
└── search

Git
├── status
├── diff
├── branch
├── checkout
└── commit

Execution
├── shell
├── tests
├── package management
└── build commands

Tool Access
├── MCP
├── HTTP
├── APIs
├── databases
└── browser automation

Infrastructure
├── Docker
├── Kubernetes
├── SSH
├── deployment
└── rollback
```

The security boundary is critical.

Agents should not receive unrestricted machine access simply because a model
requested an action. The intended flow is:

```text
Agent
  ↓
Tool Request
  ↓
GOD Claw
  ↓
GOD Guardian
  ↓
Policy Evaluation
  ↓
Risk Classification
  ↓
Allow / Deny / Approval Required
  ↓
Sandbox
  ↓
Execution
  ↓
Output
  ↓
Evidence
  ↓
Audit Record
```

This controlled-execution architecture is explicitly part of the GOD Claw
design. 

---

# GOD Guardian

**GOD Guardian** is the security, permissions and policy plane.

Example risk classes:

```text
READ
WRITE
EXECUTE
NETWORK
SECRET
EXTERNAL_COMMUNICATION
FINANCIAL
DEPLOYMENT
DESTRUCTIVE
PRIVILEGED
```

Policy outcomes:

```text
ALLOW
DENY
APPROVAL_REQUIRED
```

Guardian responsibilities include:

```text
Permission enforcement
Secret protection
Filesystem scopes
Network egress policy
Destructive-command detection
Prompt-injection defense
Dependency trust
MCP permissions
Supply-chain scanning
Code scanning
Audit logging
Human approval escalation
```

Untrusted repository content, webpages, documentation or tool output must not
be able to override system, organization, mission or user policy.

---

# GOD Sandbox

Autonomous execution should be isolated.

Potential sandbox backends:

```text
Docker
gVisor
Firecracker
WASM / WASI
Kubernetes namespaces
Virtual machines
Trusted EdgeNode runtimes
```

Each execution should receive only the capabilities required by the mission:

```text
Required files
Required commands
Required network access
Required credentials
Required compute
Required runtime
```

Default execution should never require unrestricted root access.

---

# MCP-Native Tool Fabric

GOD Machine treats external capabilities as typed tools.

Supported integration surfaces can include:

```text
MCP
HTTP
OpenAPI
GraphQL
CLI
SDK
SSH
Browser
Webhooks
Databases
Cloud APIs
```

A normalized tool definition should describe:

```text
id
version
name
description
input schema
output schema
permissions
risk class
timeout
retry policy
credential requirements
sandbox policy
```

This allows agents to discover capabilities without bypassing security
controls.

---

# Agentic IDE

GOD Machine is broader than an IDE, but an **Agentic IDE** is one of its
primary interfaces.

```text
┌─────────────────────────────────────────────────────────────┐
│ GOD MODE   Project ▼   Agents   Models   Mission   P99     │
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
│ AGENT SWARM                                                │
│ ● Architect ● Frontend ● Backend ● DB ● Security ● QA     │
├─────────────────────────────────────────────────────────────┤
│ TERMINAL │ BROWSER │ TESTS │ GIT │ MCP │ DEPLOY │ LOGS   │
└─────────────────────────────────────────────────────────────┘
```

The source architecture treats the IDE as one interface into the larger
GOD Machine runtime rather than the product itself. 

---

# P99 Verification

**P99 is an evidence and verification system.**

It does **not** mean that an AI model is magically “99% correct.”

A mission may define required gates such as:

```text
Build
Typecheck
Lint
Unit tests
Integration tests
Contract tests
End-to-end tests
Browser tests
Visual tests
Accessibility
Security scanning
Dependency scanning
Secret scanning
Container scanning
Performance checks
Acceptance criteria
Independent review
Deployment health
```

Example report:

```text
P99 VERIFICATION REPORT

Mission:
Add production health endpoint

Commit:
abc123

Artifact:
sha256:...

Build:
PASS

Typecheck:
PASS

Unit Tests:
142 / 142 PASS

Integration Tests:
28 / 28 PASS

Security Critical:
0

Security High:
0

Acceptance Criteria:
PASS

Independent Review:
PASS

Deployment Health:
PASS

Status:
VERIFIED
```

**Evidence should be attached to every claim.**

No gate should be reported as passed unless the corresponding check actually ran.

---

# Self-Healing Engineering

A future GOD Machine deployment may support controlled repair loops:

```text
Production Signal
      ↓
Incident Created
      ↓
GOD SRE
      ↓
Collect Evidence
      ↓
Reproduce
      ↓
Root Cause
      ↓
Generate Patch
      ↓
Sandbox
      ↓
Tests
      ↓
Security
      ↓
P99
      ↓
Approval Policy
      ↓
Canary
      ↓
Observe
      ↓
Promote
      │
      └──── degraded ────→ Rollback
```

Suggested autonomy policies:

```text
OFF
PROPOSE
TEST
CANARY
AUTONOMOUS_LOW_RISK
```

---

# Mission Runtime

Every significant request should become a durable mission.

Recommended states:

```text
PENDING
BLOCKED
READY
RUNNING
WAITING_APPROVAL
RETRYING
FAILED
COMPLETED
VERIFIED
CANCELLED
```

Mission state should survive process restarts.

For durable background processing, GOD Machine should use an actual queue or
workflow runtime rather than relying on an in-memory task array.

---

# EdgeNode Compute

The architecture allows a machine to become a capability node.

Potential devices:

```text
Developer laptop
Gaming PC
Workstation
Mac mini
Homelab server
VPS
GPU server
Enterprise cluster
```

A node can advertise:

```text
CPU
GPU
RAM
Storage
Models
Container support
Browser capability
Region
Latency
Trust level
Availability
Supported workloads
```

Suggested trust levels:

```text
PERSONAL
ORGANIZATION
COMMUNITY
QUARANTINED
```

Sensitive data should not automatically be routed to untrusted nodes.

The architecture also envisions local CPUs/GPUs, LAN GPUs, homelabs,
CodingAgent EdgeNodes and decentralized compute as potential inference
sources. 

---

# Deploy Anywhere

GOD Machine is intended to remain infrastructure-independent.

Potential deployment targets include:

```text
Local machine
Homelab
Bare metal
VPS
Docker
Kubernetes
Vercel
Cloudflare
AWS
Other cloud providers
EdgeNode infrastructure
```

The architecture explicitly includes deployment across local machines,
edge infrastructure, Vercel, AWS, Cloudflare, VPS, Kubernetes and bare metal. 

---

# Recommended Architecture

```text
                        CODINGAGENT.IN
                              │
                              ▼
                        GOD MACHINE
                              │
            ┌─────────────────┴──────────────────┐
            │                                    │
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

Target monorepo:

```text
The-Omnipotent-G.O.D-Machine/
│
├── apps/
│   ├── web/
│   ├── ide/
│   ├── desktop/
│   └── docs/
│
├── services/
│   ├── api/
│   ├── mission-runtime/
│   ├── worker-runtime/
│   └── router/
│
├── crates/
│   ├── god-brain/
│   ├── god-claw/
│   ├── god-router/
│   ├── god-memory/
│   ├── god-guardian/
│   ├── god-sandbox/
│   ├── god-swarm/
│   └── p99/
│
├── packages/
│   ├── agent-sdk/
│   ├── tool-sdk/
│   ├── shared-types/
│   ├── ui/
│   └── config/
│
├── mcp/
│   ├── runtime/
│   ├── registry/
│   └── servers/
│
├── workers/
│
├── edge-node/
│
├── infrastructure/
│   ├── docker/
│   ├── compose/
│   ├── kubernetes/
│   └── helm/
│
├── docs/
│   ├── assets/
│   ├── architecture/
│   ├── security/
│   ├── self-hosting/
│   └── guides/
│
├── examples/
├── tests/
├── benchmarks/
│
├── .github/
│   ├── workflows/
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
│
├── README.md
├── ARCHITECTURE.md
├── SECURITY.md
├── CONTRIBUTING.md
├── GOVERNANCE.md
├── ROADMAP.md
├── CHANGELOG.md
├── CODE_OF_CONDUCT.md
└── LICENSE
```

---

# Technology Direction

The architecture is designed to support a mixed-language stack.

```text
Frontend
React / Next.js
TypeScript
Monaco Editor
xterm.js

Desktop
Tauri

Local Runtime / Security-Critical Services
Rust

AI / Evaluation / Supporting Services
Python where appropriate

Database
PostgreSQL

Vector Search
pgvector

Queue / Cache
Redis

Object Storage
MinIO / S3-compatible storage

Containers
Docker

Browser Automation
Playwright

Observability
OpenTelemetry
Prometheus-compatible metrics

Orchestration
Docker Compose first
Kubernetes / Helm as an advanced deployment target
```

---

# Quick Start

> **Current repository status matters.**
>
> Do not publish installation commands until those commands are actually
> implemented and verified in this repository.

The planned one-command interface is:

```bash
curl -fsSL https://codingagent.in/install | sh
```

Then:

```bash
codingagent
```

Other proposed commands:

```bash
codingagent god

codingagent run "inspect this repository and fix the failing tests"

codingagent models

codingagent node start

codingagent swarm deploy
```

These commands are part of the target product architecture and should be
marked experimental until implemented. The project specification currently
defines the same one-command CLI direction. 

---

# Self-Hosting

The self-hosting objective is:

```bash
git clone <repository-url>
cd The-Omnipotent-G.O.D-Machine

docker compose up -d
```

Target local endpoints:

```text
GOD Machine UI
http://localhost:3000

GOD Router
http://localhost:8080/v1
```

Optional profiles can expose:

```text
Ollama
MinIO
Observability
EdgeNode
Development services
```

**Do not document an endpoint as working until CI verifies it.**

---

# Local LLMs

GOD Router is designed around model independence.

Example conceptual configuration:

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

The actual configuration schema must be defined by the implementation.

---

# OpenAI-Compatible Gateway

The planned GOD Router interface can expose compatible endpoints where the
underlying capabilities permit:

```text
GET  /v1/models
POST /v1/chat/completions
POST /v1/embeddings
```

Streaming should be supported where providers allow it.

Compatibility must be tested rather than claimed globally.

---

# Security

Security is a primary design requirement.

The runtime should follow:

```text
Zero trust
Least privilege
Sandbox-first execution
Explicit network policy
Scoped filesystem access
Secret isolation
Credential brokering
Audit everything
No secrets in prompts
No secrets in frontend state
No unrestricted root execution
No tool access without policy evaluation
```

Please report security vulnerabilities privately.

See:

```text
SECURITY.md
```

Do **not** open public issues containing:

```text
API keys
Access tokens
Private keys
Credentials
Production exploit details
Private vulnerability reproduction data
```

---

# Privacy

The architectural goal is:

> **Your code, your models, your memory, your infrastructure, your rules.**

A fully local configuration should be capable of operating without sending
repository content to third-party model providers.

Network egress must be explicit and observable.

Telemetry should be opt-in rather than mandatory.

---

# Observability

Every meaningful autonomous action should produce traceable evidence.

Recommended telemetry:

```text
Mission ID
Task ID
Agent
Model route
Tool
Permission decision
Sandbox
Execution duration
Token usage
Compute usage
Exit status
Verification result
Artifact hash
Deployment result
Retry history
```

Observability must not leak secrets or sensitive source content.

---

# API & SDK

Planned interfaces:

```text
REST API
WebSocket / event stream
CLI
TypeScript SDK
Python SDK
Rust interfaces
MCP
Webhooks
```

Stable public APIs should be versioned.

---

# Status

## Important

GOD Machine is an ambitious systems project.

The repository README must distinguish:

```text
IMPLEMENTED
EXPERIMENTAL
PLANNED
RESEARCH
```

Do not describe roadmap functionality as production-ready.

Do not fabricate:

```text
Benchmarks
Latency
Security audits
Test counts
User counts
Node counts
Provider availability
P99 reliability percentages
Production deployments
```

until corresponding evidence exists.

---

# Development Status Legend

Use these labels throughout documentation:

| Status          | Meaning                                      |
| --------------- | -------------------------------------------- |
| ✅ Stable        | Implemented, tested and supported            |
| 🧪 Experimental | Functional but API/behavior may change       |
| 🚧 In Progress  | Actively being developed                     |
| 📋 Planned      | Accepted architecture, not yet implemented   |
| 🔬 Research     | Exploratory work with no delivery commitment |

---

# Roadmap

Recommended delivery order:

```text
Phase 0
Repository foundation
Architecture contracts
CI
Security baseline

Phase 1
Local GOD Machine vertical slice

Phase 2
GOD Router + Ollama

Phase 3
Mission runtime + persistence

Phase 4
GOD Brain

Phase 5
GOD Claw + Guardian

Phase 6
Docker sandbox

Phase 7
Agent Swarm

Phase 8
GOD Memory + Context Engine

Phase 9
Agentic IDE

Phase 10
MCP capability fabric

Phase 11
P99 verification

Phase 12
Deployment automation

Phase 13
Observability + controlled repair

Phase 14
EdgeNode runtime

Phase 15
Distributed compute
```

---

# First Production Acceptance Test

The first meaningful vertical slice should prove that GOD Machine can operate
locally.

```text
1. Start GOD Machine locally.

2. Connect a repository.

3. Detect a local Ollama installation.

4. Display installed models.

5. Create mission:

   "Inspect this repository and add a /health endpoint."

6. GOD Brain generates:
   specification
   task graph
   acceptance criteria

7. Coding agent reads the repository.

8. GOD Claw creates a controlled branch/change set.

9. Tests execute inside the sandbox.

10. P99 records build/test evidence.

11. User receives:
    Git diff
    test results
    evidence
    limitations

12. No cloud model API is required.
```

Only after this vertical slice is reliable should broader autonomous claims be
promoted prominently.

---

# Philosophy

```text
AGENT decides.

TOOL acts.

WORKER continues.

NODE executes.

MISSION defines the outcome.

EVIDENCE proves what happened.
```

The fundamental GOD Machine equation is:

```text
MISSION
=
AGENTS
+
TOOLS
+
WORKERS
+
NODES
+
POLICIES
+
EVIDENCE
```

---

# Use Cases

GOD Machine is being designed for:

```text
Autonomous feature development
Repository understanding
Code generation
Bug fixing
Code review
Security review
Test generation
Browser testing
Dependency upgrades
Migration work
DevOps
CI/CD
Infrastructure changes
Deployment
Incident diagnosis
Controlled self-repair
Multi-repository engineering
Local/private AI development
Enterprise self-hosting
Distributed development compute
```

---

# Who Is This For?

```text
Software developers
AI engineers
Platform engineers
DevOps engineers
SRE teams
Security engineers
Open-source maintainers
Startups
AI-native engineering teams
Enterprises requiring self-hosting
Homelab builders
Local AI developers
Agent framework developers
MCP developers
```

---

# Frequently Asked Questions

## Is GOD Machine an AI coding agent?

GOD Machine contains and coordinates AI coding agents, but the system itself
is broader than one agent. It is intended to provide the orchestration,
execution, security, memory, model-routing, verification and deployment
runtime around those agents.

## What does G.O.D mean?

**Generative Omnipotent Development.**

The project source material defines GOD using this expansion and positions it
as an open, autonomous development platform.

## Is GOD Machine an Agentic IDE?

It includes an Agentic IDE, but GOD Machine is the underlying development
runtime. CLI, API, desktop, workers and other interfaces can use the same
core.

## Can GOD Machine run locally?

Local-first and self-hosted operation are core architectural requirements.

## Does GOD Machine require OpenAI?

No mandatory model provider is part of the architecture.

## Does GOD Machine support Ollama?

Ollama is one of the intended local-model runtimes for GOD Router.

## What is GOD Router?

GOD Router selects an appropriate model route based on capability, privacy,
availability, performance policy and budget.

## What is GOD Brain?

GOD Brain converts intent into specifications, plans, agent decisions,
context, model selection, execution tasks and verification requirements.

## What is GOD Claw?

GOD Claw is the controlled execution authority for filesystem, terminal, Git,
browser, API, database and infrastructure actions.

## What is GOD Swarm?

GOD Swarm coordinates specialized engineering agents that can collaborate and
execute independent tasks in parallel.

## What is GOD Memory?

GOD Memory stores scoped project, mission, developer, organization and
knowledge context for future retrieval.

## What is P99?

P99 is the verification and evidence layer. It is intended to prove that
defined engineering gates passed; it is not a blanket claim of 99% AI
correctness.

## Is GOD Machine fully autonomous?

The architecture supports multiple autonomy levels. Sensitive, privileged or
irreversible actions can require approval.

## Does GOD Machine support MCP?

MCP is intended to be a native capability and tool integration layer.

## Can GOD Machine deploy software?

Deployment automation is part of the architecture, with policy controls,
verification and rollback expected around production changes.

## Can it repair production software automatically?

Controlled observe-and-repair workflows are a planned architecture.
Autonomous production repair should be enabled only under explicitly defined
risk policies.

---

# Project Identity

```text
Project:
The Omnipotent G.O.D Machine

Abbreviation:
GOD Machine

G.O.D:
Generative Omnipotent Development

Platform:
CodingAgent

Website:
codingagent.in

Product Category:
Agentic Development Operating System

Primary Runtime:
GOD Machine

Autonomous Interface:
GOD Mode / GOD Agent

Reasoning:
GOD Brain

Execution:
GOD Claw

Models:
GOD Router

Memory:
GOD Memory

Multi-Agent:
GOD Swarm

Security:
GOD Guardian

Isolation:
GOD Sandbox

Verification:
P99
```

---

# Search & Discovery Terms

This repository is relevant to developers researching:

```text
AI coding agent
open-source AI coding agent
autonomous coding agent
self-hosted coding agent
agentic IDE
open-source agentic IDE
AI software engineer
autonomous software engineering
multi-agent coding
agent swarm coding
local LLM coding agent
Ollama coding agent
MCP coding agent
Model Context Protocol
LLM router
self-hosted LLM gateway
secure AI agents
sandboxed coding agent
AI DevOps agent
autonomous development platform
agentic development OS
sovereign AI development
```

This section exists for terminology clarity and repository discovery—not
keyword stuffing.

---

# Contributing

Contributions are welcome.

Before contributing:

```text
1. Read ARCHITECTURE.md
2. Read SECURITY.md
3. Search existing issues
4. Open an RFC for major architectural changes
5. Add tests
6. Update documentation
7. Keep security boundaries intact
8. Include evidence for behavior claims
```

Please do not bypass Guardian, sandbox or verification controls merely to make
a demo appear more autonomous.

---

# Governance

Architecture-level decisions should be documented publicly.

Major changes should use RFCs covering:

```text
Problem
Motivation
Threat model
Proposed architecture
Alternatives
Compatibility
Migration
Testing
Security impact
Operational impact
Rollout
Rollback
```

See:

```text
GOVERNANCE.md
```

---

# License

The architectural proposal recommends an open-source core.

Before publishing the repository, add the actual chosen license to:

```text
LICENSE
```

Do not display an Apache-2.0 or MIT badge until the repository license has
actually been selected and committed.

The project proposal currently recommends Apache-2.0 for the core, SDK, CLI
and EdgeNode components, while keeping future managed services separable.


---

# Repository Topics

Recommended GitHub topics:

```text
ai-coding-agent
coding-agent
autonomous-agent
autonomous-coding
agentic-ai
agentic-ide
ai-code-editor
software-engineering
multi-agent
multi-agent-system
ai-agents
mcp
model-context-protocol
local-llm
ollama
llm-router
self-hosted
developer-tools
rust
open-source
```

---

# Citation

If you use GOD Machine in research, documentation or derivative work, citation
metadata will be published once the first stable public release exists.

---

# Responsible Claims

GOD Machine documentation follows a simple rule:

> **If the system cannot prove it happened, the documentation should not claim
> it happened.**

Every production claim should eventually be backed by:

```text
Source code
Tests
CI results
Benchmarks
Signed artifacts
Security evidence
Deployment evidence
Reproducible documentation
```

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
```

### Important corrections before publishing

I intentionally made the README distinguish **architecture from shipped functionality**. That is especially important because your current source material describes things such as one-command installation, EdgeNodes, distributed compute, autonomous deployment and numerous GOD subsystems as the intended product architecture; those should only be converted from “designed/planned” to “available” when the repository actually implements them. 

The strongest canonical identity should remain:

**The Omnipotent G.O.D Machine**
**Open-Source AI Coding Agent & Agentic Development OS**
**G.O.D — Generative Omnipotent Development**

And the architectural hierarchy should stay consistent as **GOD Machine → GOD Mode → GOD Brain → GOD Claw → GOD Router → GOD Swarm → GOD Memory → GOD Context → GOD Sandbox → GOD Guardian → GOD Edge → P99**. 
