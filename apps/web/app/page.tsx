import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Nav } from './_components/nav';
import {
  JsonLd,
  breadcrumbLd,
  softwareApplicationLd,
} from './_lib/jsonld';
import { SITE, pageUrl } from './_lib/site';

export const metadata: Metadata = {
  title: `${SITE.name} — ${SITE.tagline}`,
  description: SITE.description,
  alternates: { canonical: pageUrl('/') },
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    url: pageUrl('/'),
    type: 'website',
  },
};

export default function HomePage() {
  return (
    <>
      <JsonLd data={softwareApplicationLd} />
      <JsonLd
        data={breadcrumbLd([{ name: 'Home', url: pageUrl('/') }])}
      />
      <Nav />
      <main id="main-content" className="container">
        <article>
          <header className="hero">
            <p className="eyebrow">Open Agentic Development OS</p>
            <h1>
              An open-source runtime for autonomous coding agents that
              actually finishes the work.
            </h1>
            <p className="lede">
              GOD Machine is the sovereign runtime connecting intelligence,
              agent swarms, MCP tools, model routing, secure sandboxes,
              persistent memory, and evidence-driven verification into one
              durable execution system. Local-first. Self-hosted.
              Model-agnostic.
            </p>
            <p className="chain" aria-label="Execution chain">
              <b>Think</b> → <b>Build</b> → <b>Execute</b> →{' '}
              <b>Verify</b> → <b>Deploy</b> → <b>Repair</b>
            </p>
            <div className="cta-row">
              <Link href="/god" className="btn btn-primary">
                Enter GOD Machine →
              </Link>
              <a
                href={SITE.githubUrl}
                className="btn"
                target="_blank"
                rel="noopener noreferrer"
              >
                Star on GitHub
              </a>
              <Link href="/comparisons" className="btn">
                Compare vs Cursor / Cline / OpenHands
              </Link>
            </div>
          </header>

          <section className="section" aria-labelledby="answer">
            <h2 id="answer">What is GOD Machine?</h2>
            <p className="answer">
              <strong>GOD Machine is an open-source Agentic Development
              Operating System.</strong> It is the underlying runtime that
              autonomous coding agents use to reason about a goal,
              construct a plan, execute code changes inside secure sandboxes,
              produce inspectable evidence, deploy the result, and repair
              regressions — all without unrestricted machine access. The
              acronym expands to <em>Generative Omnipotent Development</em>.
            </p>
            <p>
              GOD Machine is <strong>not another chat sidebar or
              autocomplete extension</strong>. It is a durable execution
              runtime with typed states, transactional event history,
              row-level tenant isolation, and worker leases with expiry
              and reclamation. Agents plug into it — they do not replace
              it.
            </p>
          </section>

          <section className="section" id="kernel" aria-labelledby="kernel-h">
            <h2 id="kernel-h">The eight kernel components</h2>
            <p>
              GOD Machine's design decomposes an autonomous development
              runtime into eight components with a single responsibility
              each. Every ADR in the repository maps to one of them.
            </p>
            <div className="grid">
              <Card
                title="GOD Machine"
                body="The sovereign runtime. Owns missions, workspaces, agents, tools, sandboxes, deployments, observability."
                status="progress"
                statusLabel="Phase 0–2A landed"
              />
              <Card
                title="GOD Mode"
                body="Highest-autonomy operating mode with per-mission autonomy levels: ASK, ASSIST, EXECUTE, AUTONOMOUS, P99."
                status="todo"
                statusLabel="Planned"
              />
              <Card
                title="GOD Brain"
                body="Intent → specification → plan → task DAG → agent selection → budget control."
                status="todo"
                statusLabel="Planned (M2)"
              />
              <Card
                title="GOD Claw"
                body="Sole execution authority. Every filesystem, terminal, Git, HTTP, database, deployment call flows through Claw."
                status="todo"
                statusLabel="Planned (M2)"
              />
              <Card
                title="GOD Router"
                body="Provider-agnostic model routing across local, edge, free, and paid providers. FREE mode never silently escalates."
                status="todo"
                statusLabel="Planned (M2)"
              />
              <Card
                title="GOD Memory"
                body="Six persistent memory layers, from active task context to organization knowledge, all retrieval-selective."
                status="todo"
                statusLabel="Planned (M3)"
              />
              <Card
                title="GOD Guardian"
                body="Policy, identity, and human-approval plane. Secrets never enter model prompts."
                status="progress"
                statusLabel="Identity + RLS shipped"
              />
              <Card
                title="P99"
                body="Verification engine. A mission cannot be marked VERIFIED without evidence for every required gate."
                status="todo"
                statusLabel="Planned (M4)"
              />
            </div>
          </section>

          <section className="section" aria-labelledby="why">
            <h2 id="why">Why an operating system, and not another IDE plugin?</h2>
            <p>
              Because autonomous agents fail at the boundary between
              intelligence and infrastructure. Give an agent unrestricted
              shell access and it will eventually delete the wrong file.
              Give it a fragile mission runner and it will lose state on
              the first crash. Give it a hosted-only backend and its work
              never leaves someone else's cloud.
            </p>
            <p>
              GOD Machine treats the runtime as a first-class product.
              Missions live in Postgres and survive process restarts.
              Tenant isolation is enforced at the row-level-security
              layer, not in application code. Every state transition is a
              conditional UPDATE plus a transactional event append —
              rejected transitions leave no side effect. Workers acquire
              leases with expiry; a killed worker's task is reclaimed by
              another after the lease expires. Every intelligent
              component (Brain, Router, Claw, Swarm) sits on top of that
              substrate, not next to it.
            </p>
          </section>

          <section className="section" aria-labelledby="how-it-works">
            <h2 id="how-it-works">How a mission runs, end to end</h2>
            <ol className="steps">
              <li><strong>Intent.</strong> A user (or a scheduled trigger) describes desired work in natural language.</li>
              <li><strong>Specification.</strong> GOD Brain compiles intent into acceptance criteria, constraints, and privacy class.</li>
              <li><strong>Plan.</strong> The planner decomposes the spec into a task DAG with typed dependencies.</li>
              <li><strong>Agent selection.</strong> Each task is matched to a specialist agent role (Architect, Coder, Reviewer, Security, QA, DevOps).</li>
              <li><strong>Model routing.</strong> GOD Router picks a model per task using capability, privacy, cost, and historical reliability.</li>
              <li><strong>Tool selection.</strong> Agents request tools via typed contracts, never raw shell access.</li>
              <li><strong>GOD Claw execution.</strong> The policy engine classifies risk, gates approvals, allocates a sandbox, and runs the tool.</li>
              <li><strong>Sandbox.</strong> Docker, Firecracker, or WASM — matched to the risk class. No root by default.</li>
              <li><strong>Evidence.</strong> Results and artifacts stream into an append-only evidence table.</li>
              <li><strong>P99 verification.</strong> Required gates (build, tests, security, deployment health) run and produce evidence.</li>
              <li><strong>Deployment.</strong> If policy allows, the artifact is deployed; health is verified; rollback is prepared.</li>
              <li><strong>Observation and repair.</strong> Regressions in production trigger a diagnosis mission, then a repair mission.</li>
            </ol>
          </section>

          <section className="section" aria-labelledby="principles">
            <h2 id="principles">Design principles</h2>
            <div className="grid">
              <Card title="Sovereignty" body="Local-first, self-hostable. Your code, your models, your infrastructure, your rules." />
              <Card title="Model independence" body="No vendor is required. Providers are plugins scored by fit, privacy, and cost." />
              <Card title="Evidence-driven autonomy" body="P99 gates produce evidence artifacts. A mission is not VERIFIED without them." />
              <Card title="Six primitives" body="Agent, Tool, Worker, Node, Mission, Evidence. Everything else is derived." />
              <Card title="Policy-controlled execution" body="Models request; policy decides. Every tool call is classified, sandboxed, and audited." />
              <Card title="Durable by construction" body="Missions live in Postgres. Worker crashes are recoverable. Server restarts are safe." />
            </div>
          </section>

          <section className="section" aria-labelledby="status">
            <h2 id="status">Current status — honest roadmap</h2>
            <div className="status-banner">
              GOD Machine is under active initial construction. What is
              live and evidence-backed on `main` today: identity, DB-backed
              sessions, organizations + memberships + roles, row-level
              tenant isolation, an append-only aggregate-scoped event log,
              integration CI with a real Postgres. The durable mission
              runtime schema is landed; the runtime kernel is the next
              milestone.
            </div>
            <div className="grid milestones">
              <Milestone name="M0 · Foundation" status="live" body="Auth · Sessions · Orgs · Roles · RLS · Events · CI" version="v0.1.0-rc1" />
              <Milestone name="M1 · Durable Runtime" status="build" body="State kernel · DAG · Leases · Retry · Recovery" version="v0.2.0" />
              <Milestone name="M2 · Single-Agent GOD" status="planned" body="Router + Brain + Claw + Sandbox + Coder Agent" version="v0.3.0" />
              <Milestone name="M3 · Multi-Agent GOD" status="planned" body="Swarm · Memory · MCP · Agentic IDE" version="v0.4.0" />
              <Milestone name="M4 · Verified Factory" status="planned" body="P99 · Deployment · Triggers" version="v0.5–0.6" />
              <Milestone name="M5 · Distributed Sovereign" status="planned" body="Self-healing · EdgeNodes · Distributed compute" version="v0.7–0.8" />
              <Milestone name="M6 · Production Release" status="planned" body="Hardening · CLI · SDKs · Signed releases" version="v1.0.0" />
            </div>
            <p className="status-footnote">
              Per-item detail lives in{' '}
              <a href={`${SITE.githubUrl}/blob/main/docs/BUILD-TRACKER.md`}
                target="_blank" rel="noopener noreferrer">
                docs/BUILD-TRACKER.md
              </a>{' '}
              on GitHub. Nothing is claimed VERIFIED without a linked
              test or CI job.
            </p>
          </section>

          <section className="section" aria-labelledby="quick-start">
            <h2 id="quick-start">Quick start — self-host locally</h2>
            <pre><code>{`# Requires Node 20+, pnpm 9+, Docker

git clone ${SITE.githubUrl}.git
cd The-Omnipotent-G.O.D-Machine-

pnpm install
cp .env.example .env

docker compose -f infrastructure/compose/dev.yml up -d
pnpm --filter @god/db migrate
pnpm --filter @god/web dev`}</code></pre>
            <p>
              Then open <code>http://localhost:3000</code>, register an
              account, and you land in the protected <code>/app</code>{' '}
              shell backed by real Postgres data with row-level tenant
              isolation enabled from the first request.
            </p>
          </section>

          <section className="section" aria-labelledby="learn-more">
            <h2 id="learn-more">Learn more</h2>
            <ul className="link-list">
              <li><Link href="/god">GOD Machine — full product overview →</Link></li>
              <li><Link href="/what-is-agentic-development-os">What is an Agentic Development OS? →</Link></li>
              <li><Link href="/what-is-a-coding-agent">What is an AI coding agent? →</Link></li>
              <li><Link href="/comparisons">Compare GOD Machine vs Cursor / Cline / OpenHands / Copilot →</Link></li>
              <li><Link href="/security">Security architecture (RLS, threat model, sandboxing) →</Link></li>
              <li><Link href="/faq">Frequently asked questions →</Link></li>
            </ul>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Card({
  title,
  body,
  status,
  statusLabel,
}: {
  title: string;
  body: string;
  status?: 'todo' | 'progress' | 'verified';
  statusLabel?: string;
}) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{body}</p>
      {status ? (
        <span className={`tag tag-${status}`}>{statusLabel ?? status}</span>
      ) : null}
    </article>
  );
}

function Milestone({
  name,
  status,
  body,
  version,
}: {
  name: string;
  status: 'live' | 'build' | 'planned';
  body: string;
  version: string;
}) {
  const label =
    status === 'live' ? 'Live' : status === 'build' ? 'In build' : 'Planned';
  return (
    <article className="card milestone">
      <h3>{name}</h3>
      <p>{body}</p>
      <div className="milestone-meta">
        <span className={`tag tag-${status === 'live' ? 'verified' : status === 'build' ? 'progress' : 'todo'}`}>
          {label}
        </span>
        <code className="version">{version}</code>
      </div>
    </article>
  );
}
