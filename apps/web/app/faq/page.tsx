import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Nav } from '../_components/nav';
import { JsonLd, breadcrumbLd, faqPageLd } from '../_lib/jsonld';
import { pageUrl } from '../_lib/site';

const URL = pageUrl('/faq');
const TITLE = 'GOD Machine — Frequently Asked Questions';
const DESCRIPTION =
  'Answers to common questions about GOD Machine: what it is, how it compares to Cursor and Cline, whether it runs locally, whether it needs OpenAI, what P99 verification means, what an Agentic Development OS is, and how autonomy levels work.';

// Q&A entries — extracted into data so both the FAQPage JSON-LD and the
// rendered page pull from the same source of truth. Question wording is
// tuned for real search intent (People Also Ask), answers are 40–80 words
// each (Google's featured-snippet sweet spot).
const FAQ = [
  {
    q: 'What is GOD Machine?',
    a: 'GOD Machine is an open-source Agentic Development Operating System. It is the runtime that autonomous coding agents use to reason about a goal, plan work as a DAG, execute changes in secure sandboxes, produce inspectable evidence, and deploy the result. G.O.D expands to Generative Omnipotent Development. It is Apache-2.0, self-hostable, model-agnostic, and enforces row-level tenant isolation at the database.',
  },
  {
    q: 'What does G.O.D stand for?',
    a: 'Generative Omnipotent Development. GOD Machine is the sovereign runtime under the CodingAgent platform.',
  },
  {
    q: 'Is GOD Machine an AI coding agent?',
    a: 'GOD Machine contains and coordinates AI coding agents, but the system itself is broader than any single agent. It provides orchestration, execution authority, security policy, memory, model routing, verification, and deployment around those agents. Agents are pluggable; the runtime is not.',
  },
  {
    q: 'Is GOD Machine an Agentic IDE?',
    a: 'It includes an Agentic IDE surface, but GOD Machine is the underlying runtime. A CLI, a REST API, a desktop shell, a persistent worker service, and other interfaces all use the same core. The IDE is one client, not the product.',
  },
  {
    q: 'Can GOD Machine run locally without any cloud provider?',
    a: 'Yes. Local-first and self-hosted operation is a core architectural requirement. A fully local configuration can run without sending repository content to third-party model providers. GOD Router prefers local models when the FREE or PRIVATE routing mode is selected.',
  },
  {
    q: 'Does GOD Machine require OpenAI or a specific LLM provider?',
    a: 'No. No model provider is mandatory. GOD Router treats providers as plugins: local (Ollama, llama.cpp, vLLM, SGLang), edge (LAN or EdgeNodes), and cloud (OpenAI-compatible, Anthropic, others). PRIVATE and FREE modes never silently escalate to a paid provider.',
  },
  {
    q: 'Does GOD Machine support Ollama?',
    a: 'Yes. Ollama is one of the intended local-model runtimes for GOD Router. Any OpenAI-compatible local server also works.',
  },
  {
    q: 'What is GOD Router?',
    a: 'GOD Router is the model-intelligence layer that selects an appropriate model route based on task type, capability requirements, privacy class, latency target, historical reliability, and budget. Providers are scored and ranked per request; failed calls fall back through the ranked list.',
  },
  {
    q: 'What is GOD Brain?',
    a: 'GOD Brain is the reasoning and orchestration layer. It converts intent into a specification, decomposes the specification into a task DAG, selects agents and models, requests context, applies budgets, and coordinates critic/reviewer/judge loops. Brain never executes commands — the runtime and Claw do.',
  },
  {
    q: 'What is GOD Claw?',
    a: 'GOD Claw is the sole execution authority. Every filesystem operation, terminal command, Git action, browser interaction, HTTP call, database query, and deployment goes through Claw. Agents have zero ambient authority — every capability is a typed tool contract with a risk classification.',
  },
  {
    q: 'What is GOD Swarm?',
    a: 'GOD Swarm is the multi-agent engineering runtime. Default roles include Oracle, Architect, Planner, Coder, Frontend, Backend, Database, Security, QA, Browser, DevOps, SRE, Performance, Reviewer, Documentation, Critic, Judge, and Guardian. Agents run concurrently when mission dependencies allow.',
  },
  {
    q: 'What is GOD Memory?',
    a: 'GOD Memory stores scoped context across six layers: L0 active context, L1 mission memory, L2 project memory, L3 developer memory, L4 organization memory, and L5 knowledge memory. Retrieval is selective — no dumping entire repositories into a prompt window.',
  },
  {
    q: 'What is P99 verification?',
    a: 'P99 is an evidence and verification system. It is NOT a claim that AI models are 99% correct. A mission cannot be marked VERIFIED until every required gate — build, tests, security scans, dependency audit, deployment health — produces an evidence artifact. task_run.SUCCEEDED means the executor honored its contract; P99 independently decides verification.',
  },
  {
    q: 'Is GOD Machine fully autonomous?',
    a: 'Only when you configure it that way. Autonomy is a per-mission level: ASK, ASSIST, EXECUTE, AUTONOMOUS, or P99. Destructive, financial, external-communication, and privileged tool calls require approval at every autonomy level unless an admin has installed a standing approval policy.',
  },
  {
    q: 'Does GOD Machine support MCP (Model Context Protocol)?',
    a: 'Yes. MCP is a native capability and tool-integration layer. Third-party MCP servers plug in with per-org permissions and go through the same Guardian policy evaluation as built-in tools.',
  },
  {
    q: 'Can GOD Machine deploy software?',
    a: 'Yes. Deployment automation is part of the architecture, with policy controls, verification, health checks, and rollback readiness. Initial adapters target Docker Compose, then Vercel and Kubernetes.',
  },
  {
    q: 'Can GOD Machine repair production software automatically?',
    a: 'Controlled observe-and-repair loops are part of the design. Autonomous production repair is enabled only under explicitly configured risk policies: OFF, PROPOSE, TEST, CANARY, or AUTONOMOUS_LOW_RISK. A repair mission goes through P99 verification like any other mission.',
  },
  {
    q: 'How does GOD Machine differ from Cursor?',
    a: 'Cursor is an AI-augmented editor. GOD Machine is a durable execution runtime with multi-agent orchestration, secure sandboxing, verification, and deployment. GOD Machine is not primarily an editor — it includes an Agentic IDE surface, but the same runtime is used by a CLI, an API, and background workers.',
  },
  {
    q: 'How does GOD Machine differ from Cline?',
    a: 'Cline is an agentic coding extension embedded in VS Code. GOD Machine is a standalone runtime with its own persistence, tenant isolation, worker leases, and verification engine — designed to run production workloads unattended, not just interactive sessions inside an editor.',
  },
  {
    q: 'How does GOD Machine differ from OpenHands?',
    a: 'OpenHands is a self-hosted agent environment with a strong CLI and browser surface. GOD Machine shares the self-host-first philosophy and adds an explicit multi-milestone kernel (M0 foundation, M1 durable runtime, M2 single-agent, M3 swarm, M4 verified factory), P99 evidence-driven verification, and RLS-enforced multi-tenancy at the database layer.',
  },
  {
    q: 'How does GOD Machine differ from GitHub Copilot?',
    a: 'Copilot is an inline code completion and chat product hosted by GitHub. GOD Machine is not code completion — it is an autonomous runtime that plans, executes, tests, verifies, and deploys work end-to-end on infrastructure you control.',
  },
  {
    q: 'What license is GOD Machine released under?',
    a: 'Apache-2.0 for the core runtime, SDKs, CLI, and EdgeNode components. Any future managed hosted service is separately licensed and is never a prerequisite for using the open-source core.',
  },
  {
    q: 'Is GOD Machine production-ready today?',
    a: 'Not yet. The foundation (auth, tenant isolation, RLS, event log, integration CI) is landed as v0.1.0-rc1. The durable mission runtime kernel is next. The full production release is planned as v1.0.0 after M6 hardening. Every subsystem\'s honest status is in docs/BUILD-TRACKER.md on GitHub.',
  },
  {
    q: 'Where can I read the architecture in full?',
    a: 'The full architecture document is docs/GOD-MACHINE-ARCHITECTURE.md in the repository, along with numbered ADRs (0001–0007) that freeze specific decisions like the model router abstraction, GOD Claw execution boundary, storage layer, mission event model, ORM choice, and durable mission runtime.',
  },
  {
    q: 'How is GOD Machine secured against prompt injection?',
    a: 'Repository content, tool outputs, web pages, and documentation are treated as UNTRUSTED CONTENT and cannot override SYSTEM POLICY, DEVELOPER INSTRUCTION, USER INTENT, or TRUSTED PROJECT CONFIG. Destructive and financial tool calls require per-call approval whenever the originating input touches untrusted content. Full threat model is in docs/THREAT-MODEL.md.',
  },
] as const;

export const metadata: Metadata = {
  title: 'FAQ',
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: 'article',
  },
};

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={faqPageLd(FAQ.map(({ q, a }) => ({ question: q, answer: a })))}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: pageUrl('/') },
          { name: 'FAQ', url: URL },
        ])}
      />
      <Nav />
      <main id="main-content" className="container">
        <article>
          <header className="hero">
            <p className="eyebrow">Answers</p>
            <h1>Frequently Asked Questions</h1>
            <p className="lede">
              Common questions about GOD Machine — what it is, how it
              works, how it compares to other coding agents, and what
              parts are live today.
            </p>
          </header>

          <section className="section" aria-labelledby="faq">
            <h2 id="faq" className="visually-hidden">
              Questions and answers
            </h2>
            <dl className="faq">
              {FAQ.map(({ q, a }) => (
                <div key={q} className="faq-item">
                  <dt>
                    <h3>{q}</h3>
                  </dt>
                  <dd>{a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="section" aria-labelledby="more">
            <h2 id="more">More</h2>
            <ul className="link-list">
              <li><Link href="/god">GOD Machine — full product overview →</Link></li>
              <li><Link href="/what-is-agentic-development-os">What is an Agentic Development OS? →</Link></li>
              <li><Link href="/what-is-a-coding-agent">What is an AI coding agent? →</Link></li>
              <li><Link href="/comparisons">Compare vs Cursor / Cline / OpenHands / Copilot →</Link></li>
              <li><Link href="/security">Security architecture →</Link></li>
            </ul>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
