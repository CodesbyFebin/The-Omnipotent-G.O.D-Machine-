import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Nav } from '../_components/nav';
import {
  JsonLd,
  articleLd,
  breadcrumbLd,
  softwareApplicationLd,
} from '../_lib/jsonld';
import { SITE, pageUrl } from '../_lib/site';

const URL = pageUrl('/god');
const TITLE = 'GOD Machine — The Open Agentic Development OS';
const DESCRIPTION =
  'GOD Machine is the open-source Agentic Development Operating System — autonomous agents, MCP tools, model routing, secure sandboxes, persistent memory, P99 verification, deployment automation, self-healing workflows. Self-hosted. Model-agnostic. Sovereign.';

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: 'article',
  },
};

export default function GodPage() {
  return (
    <>
      <JsonLd data={softwareApplicationLd} />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: pageUrl('/') },
          { name: 'GOD Machine', url: URL },
        ])}
      />
      <JsonLd
        data={articleLd({
          headline: TITLE,
          description: DESCRIPTION,
          url: URL,
          datePublished: '2026-08-09',
          dateModified: new Date().toISOString().slice(0, 10),
        })}
      />
      <Nav />
      <main id="main-content" className="container">
        <article>
          <header className="hero">
            <p className="eyebrow">Product overview</p>
            <h1>GOD Machine</h1>
            <p className="lede">
              Build software with an autonomous engineering system. GOD
              Machine is the sovereign runtime connecting reasoning,
              agent swarms, MCP tools, secure execution, memory,
              deployment, and P99 verification into a single durable
              operating system.
            </p>
            <p className="chain" aria-label="Execution chain">
              INTENT → PLAN → AGENTS → TOOLS → EXECUTION → VERIFICATION →
              DEPLOYMENT
            </p>
            <div className="cta-row">
              <a
                href={SITE.githubUrl}
                className="btn btn-primary"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub →
              </a>
              <Link href="/comparisons" className="btn">
                See how it compares
              </Link>
              <Link href="/faq" className="btn">
                Frequently asked questions
              </Link>
            </div>
          </header>

          <section className="section" aria-labelledby="short-answer">
            <h2 id="short-answer">GOD Machine in one paragraph</h2>
            <p className="answer">
              <strong>GOD Machine is the open-source Agentic
              Development Operating System behind CodingAgent.</strong>{' '}
              It provides a durable mission runtime, multi-agent swarm
              orchestration, model-agnostic LLM routing, an MCP-native
              tool fabric, secure sandboxed execution, persistent
              multi-layer memory, evidence-driven P99 verification,
              deployment automation, and self-healing repair loops —
              all under Apache-2.0, self-hostable end-to-end, with
              row-level tenant isolation from the first request.
            </p>
          </section>

          <section className="section" aria-labelledby="architecture">
            <h2 id="architecture">Architecture at a glance</h2>
            <pre><code>{`                    CODINGAGENT / GOD
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
                   OBSERVE → REPAIR`}</code></pre>
          </section>

          <section className="section" aria-labelledby="components">
            <h2 id="components">The kernel — component by component</h2>
            <ComponentBlock
              id="god-agent"
              title="GOD Agent"
              body="The primary autonomous software-engineering interface. An agent is bound to a role (Architect, Coder, Reviewer, Security, QA, DevOps…), a set of allowed tools, a permission scope, a model policy, a budget, a timeout, and a retry policy. Agents delegate to sub-agents up to a configurable depth."
            />
            <ComponentBlock
              id="god-mode"
              title="GOD Mode"
              body="Maximum-autonomy operating mode with configurable per-mission autonomy levels: ASK (propose only), ASSIST (safe edits auto-run), EXECUTE (approved-in-mission tool calls run), AUTONOMOUS (unattended policy-compliant execution), P99 (autonomous + mandatory verification gates)."
            />
            <ComponentBlock
              id="god-brain"
              title="GOD Brain"
              body="Reasoning and orchestration. Modules: intent compiler, specification generator, planner, decomposer, context builder, agent selector, model selector, tool selector, critic, reviewer, judge, verifier, policy, budget, memory, learning. Brain never executes commands — it emits a mission DAG."
            />
            <ComponentBlock
              id="god-router"
              title="GOD Router"
              body="Provider-agnostic model routing. Local (Ollama, llama.cpp, vLLM, SGLang), edge (LAN nodes, EdgeNodes), and cloud (any OpenAI-compatible or Anthropic API). Routing scores candidates on quality × task-fit × reliability × tool-calling × context-fit × privacy ÷ (cost × latency × failure probability). FREE mode never silently escalates to paid providers."
            />
            <ComponentBlock
              id="god-claw"
              title="GOD Claw"
              body="Controlled execution authority. Every filesystem read/write, Git operation, shell command, browser action, HTTP call, database query, Docker invocation, and deployment goes through Claw. Agents get zero ambient authority — every capability is a typed tool contract with a risk classification."
            />
            <ComponentBlock
              id="god-guardian"
              title="GOD Guardian"
              body="Security, permissions, policy, and human-approval plane. Classifies each tool request into risk categories (READ, WRITE, EXECUTE, NETWORK, SECRET, DESTRUCTIVE, FINANCIAL, EXTERNAL_COMMUNICATION, PRIVILEGED, DEPLOYMENT). Enforces org policy. Detects destructive commands, secrets in outputs, prompt-injection attempts. Prompts a human when required."
            />
            <ComponentBlock
              id="god-sandbox"
              title="GOD Sandbox"
              body="Isolation for autonomous execution. Docker (default), Firecracker (hostile-code), gVisor, WASM/WASI (deterministic low-privilege), Kubernetes namespaces (shared cluster). Every sandbox receives only the files, credentials, network egress, and runtime it needs. No root by default."
            />
            <ComponentBlock
              id="god-memory"
              title="GOD Memory"
              body="Six persistent layers: L0 active context, L1 mission memory, L2 project memory, L3 developer memory, L4 organization memory, L5 knowledge/documentation memory. Retrieval is selective — no dumping entire repositories into a prompt window."
            />
            <ComponentBlock
              id="p99"
              title="P99"
              body="Evidence and verification engine. NOT a marketing claim of 99% AI correctness. A mission cannot be marked VERIFIED until every required gate — build, typecheck, lint, unit tests, integration tests, security scans, dependency audit, deployment health — produces an evidence artifact. task_run.SUCCEEDED means the executor honored its contract; P99 independently decides whether verification is met."
            />
          </section>

          <section className="section" aria-labelledby="autonomy">
            <h2 id="autonomy">Autonomy levels</h2>
            <div className="grid">
              <Card name="ASK" body="The model proposes actions. Nothing runs without you." />
              <Card name="ASSIST" body="Safe reversible edits (workspace-scoped writes, formatters) may auto-run." />
              <Card name="EXECUTE" body="Approved-in-mission tool calls run without per-call approval." />
              <Card name="AUTONOMOUS" body="Policy-compliant mission continues unattended. Guardian still gates DESTRUCTIVE, FINANCIAL, EXTERNAL_COMMUNICATION." />
              <Card name="P99" body="Autonomous plus mandatory P99 verification before any VERIFIED state." />
            </div>
          </section>

          <section className="section" aria-labelledby="use-cases">
            <h2 id="use-cases">What GOD Machine is designed for</h2>
            <ul className="link-list">
              <li>Autonomous feature development on real codebases</li>
              <li>Repository understanding and codebase Q&amp;A</li>
              <li>Bug fixing with test-backed evidence</li>
              <li>Code review and security review at scale</li>
              <li>Automated test generation and coverage lifts</li>
              <li>Browser-based E2E test authoring and repair</li>
              <li>Dependency upgrades with contract verification</li>
              <li>Cross-service migration work</li>
              <li>DevOps and CI/CD automation</li>
              <li>Infrastructure changes with policy approval</li>
              <li>Deployment automation with rollback readiness</li>
              <li>Incident diagnosis and self-healing repair loops</li>
              <li>Multi-repository engineering coordination</li>
              <li>Local / private AI development for enterprise self-hosting</li>
              <li>Distributed development compute across trusted EdgeNodes</li>
            </ul>
          </section>

          <section className="section" aria-labelledby="not-for">
            <h2 id="not-for">What GOD Machine is deliberately not</h2>
            <ul className="link-list">
              <li>Not a chat sidebar attached to an editor.</li>
              <li>Not a single-vendor AI product — no LLM provider is required.</li>
              <li>Not a hosted-only service — self-hosting is a first-class deployment target.</li>
              <li>Not a code-autocomplete plugin — GOD Agent proposes plans and produces evidence, not tab suggestions.</li>
              <li>Not a marketing surface for capabilities that do not exist yet — the roadmap section is a real tracker.</li>
            </ul>
          </section>

          <section className="section" aria-labelledby="deeper">
            <h2 id="deeper">Go deeper</h2>
            <ul className="link-list">
              <li><Link href="/comparisons">Compare vs Cursor, Cline, OpenHands, GitHub Copilot →</Link></li>
              <li><Link href="/what-is-agentic-development-os">What is an Agentic Development OS? (definitional) →</Link></li>
              <li><Link href="/what-is-a-coding-agent">What is an AI coding agent? (definitional) →</Link></li>
              <li><Link href="/security">Security architecture — RLS, threat model, sandboxing →</Link></li>
              <li><Link href="/faq">Frequently asked questions →</Link></li>
              <li><a href={`${SITE.githubUrl}/blob/main/docs/GOD-MACHINE-ARCHITECTURE.md`} target="_blank" rel="noopener noreferrer">Full architecture document on GitHub →</a></li>
              <li><a href={`${SITE.githubUrl}/blob/main/docs/BUILD-TRACKER.md`} target="_blank" rel="noopener noreferrer">Live build tracker on GitHub →</a></li>
            </ul>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}

function ComponentBlock({
  id,
  title,
  body,
}: {
  id: string;
  title: string;
  body: string;
}) {
  return (
    <section className="component-block" aria-labelledby={id}>
      <h3 id={id}>{title}</h3>
      <p>{body}</p>
    </section>
  );
}

function Card({ name, body }: { name: string; body: string }) {
  return (
    <article className="card">
      <h3>{name}</h3>
      <p>{body}</p>
    </article>
  );
}
