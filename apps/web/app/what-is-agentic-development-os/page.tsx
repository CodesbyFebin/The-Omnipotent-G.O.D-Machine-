import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Nav } from '../_components/nav';
import {
  JsonLd,
  articleLd,
  breadcrumbLd,
  definedTermLd,
} from '../_lib/jsonld';
import { pageUrl } from '../_lib/site';

const URL = pageUrl('/what-is-agentic-development-os');
const TITLE = 'What is an Agentic Development Operating System?';
const DESCRIPTION =
  'An Agentic Development Operating System is the runtime that autonomous coding agents use to reason, plan, execute, verify, deploy, and repair software. Defined, compared to an IDE and an agent framework, with concrete examples.';

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
  keywords: [
    'agentic development OS',
    'agentic development operating system',
    'AI development OS',
    'autonomous development platform',
    'multi-agent development runtime',
    'agentic coding runtime',
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={definedTermLd({
          name: 'Agentic Development Operating System',
          description: DESCRIPTION,
          url: URL,
        })}
      />
      <JsonLd
        data={articleLd({
          headline: TITLE,
          description: DESCRIPTION,
          url: URL,
          datePublished: '2026-08-10',
        })}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: 'Home', url: pageUrl('/') },
          { name: 'Topics', url: pageUrl('/') },
          { name: 'What is an Agentic Development OS?', url: URL },
        ])}
      />
      <Nav />
      <main id="main-content" className="container">
        <article>
          <header className="hero">
            <p className="eyebrow">Definition</p>
            <h1>What is an Agentic Development Operating System?</h1>
            <p className="lede">
              A precise, engineer-first definition — with the boundaries
              that separate it from an IDE, an agent framework, and a
              chatbot with a code editor.
            </p>
          </header>

          <section className="section" aria-labelledby="short">
            <h2 id="short">The short answer</h2>
            <p className="answer">
              <strong>
                An Agentic Development Operating System (Agentic Development OS)
                is the runtime layer that autonomous coding agents use to
                reason about a goal, plan work as a task DAG, execute
                changes inside secure sandboxes, produce inspectable
                evidence, and deploy the result — all under durable
                persistence, policy control, and tenant isolation.
              </strong>{' '}
              It is not the agent, not the model, and not the editor. It
              is the substrate every autonomous engineering workflow runs
              on top of.
            </p>
          </section>

          <section className="section" aria-labelledby="components">
            <h2 id="components">Required components</h2>
            <p>
              An Agentic Development OS must provide, at minimum:
            </p>
            <ol className="steps">
              <li><strong>A durable mission runtime.</strong> Missions and tasks live in a database, survive process restarts, and expose typed state machines. In-memory-only orchestration does not qualify.</li>
              <li><strong>A DAG scheduler.</strong> Tasks are nodes with dependencies. The runtime resolves readiness, hands ready tasks to workers, and tracks per-task attempts.</li>
              <li><strong>Worker leases with expiry and reclamation.</strong> A killed worker's task is reclaimed by another after a lease timeout — the mission does not stall.</li>
              <li><strong>An execution authority.</strong> A single, policy-gated boundary between agents and the real world: filesystem, shell, Git, HTTP, database, deployment. Agents never bypass it.</li>
              <li><strong>Isolated execution.</strong> Docker, Firecracker, WASM, or equivalent — matched to the risk class of the task.</li>
              <li><strong>An event log.</strong> Append-only, transactional with state changes, per-aggregate chained. It IS the audit trail.</li>
              <li><strong>Tenant isolation at the data layer.</strong> Row-level security or an equivalent DB-enforced boundary — application-layer scoping is not sufficient.</li>
              <li><strong>Model independence.</strong> Providers are plugins. Local, edge, and cloud are all first-class. No single vendor is required.</li>
              <li><strong>Verification separate from execution.</strong> A task's success flag is not a claim of correctness — evidence gates decide that independently.</li>
            </ol>
          </section>

          <section className="section" aria-labelledby="not">
            <h2 id="not">What it is not</h2>
            <div className="grid">
              <Card
                title="Not an IDE"
                body="An IDE is a client. An Agentic Development OS is a runtime. The same OS can be driven by an IDE, a CLI, a REST API, a scheduled worker, or a webhook."
              />
              <Card
                title="Not an agent framework"
                body="Agent frameworks (LangChain, LlamaIndex, AutoGen) provide agent construction primitives. An Agentic Development OS is the environment those agents run inside, with persistence, policy, and isolation the framework does not own."
              />
              <Card
                title="Not a chat wrapper"
                body="A chatbot with a code editor tab does not qualify. Missions must be durable, tasks must survive worker crashes, and evidence must be inspectable independent of any chat session."
              />
              <Card
                title="Not a coding copilot"
                body="Autocomplete and inline suggestions are IDE features. An Agentic Development OS coordinates end-to-end work: plan → execute → verify → deploy → repair."
              />
            </div>
          </section>

          <section className="section" aria-labelledby="example">
            <h2 id="example">A concrete example</h2>
            <p>
              A user asks: <em>&ldquo;Ship the missing <code>/health</code>{' '}
              endpoint on our API, with tests and monitoring.&rdquo;</em>
            </p>
            <p>An Agentic Development OS turns that into:</p>
            <pre><code>{`Mission
 ├─ Task: read repo layout          → SUCCEEDED (evidence: file tree)
 ├─ Task: add /health handler       → SUCCEEDED (evidence: diff)
 ├─ Task: write unit + integration  → SUCCEEDED (evidence: 4 passing tests)
 ├─ Task: run full test suite       → SUCCEEDED (evidence: 187/187)
 ├─ Task: add uptime probe          → SUCCEEDED (evidence: monitoring config)
 └─ Task: open PR with evidence     → SUCCEEDED (evidence: PR URL)

Mission COMPLETED · P99 report: verified`}</code></pre>
            <p>
              A chat wrapper produces the diff. An Agentic Development OS
              produces the diff, the tests, the evidence, the PR, and the
              audit chain — and reclaims the work if the machine running
              any task dies partway through.
            </p>
          </section>

          <section className="section" aria-labelledby="why">
            <h2 id="why">Why the distinction matters</h2>
            <p>
              Autonomous agents fail at the boundary between intelligence
              and infrastructure. Give an agent unrestricted shell access
              and it will eventually run the wrong command. Give it a
              fragile mission runner and it will lose state on the first
              crash. Give it a hosted-only backend and its work never
              leaves someone else's cloud.
            </p>
            <p>
              An Agentic Development OS treats the runtime as a first-class
              product. Every state transition is a conditional database
              update plus a transactional event append. Every tool call is
              typed, permissioned, sandboxed, and audited. Every mission
              survives crashes. Every tenant is isolated at the row-level.
              The intelligence sits on top — replaceable, upgradable,
              recomposable.
            </p>
          </section>

          <section className="section" aria-labelledby="see-also">
            <h2 id="see-also">See also</h2>
            <ul className="link-list">
              <li><Link href="/what-is-a-coding-agent">What is an AI coding agent? →</Link></li>
              <li><Link href="/god">GOD Machine — one implementation of an Agentic Development OS →</Link></li>
              <li><Link href="/comparisons">Compare Agentic Development OS options →</Link></li>
              <li><Link href="/security">Security architecture of an Agentic Development OS →</Link></li>
              <li><Link href="/faq">FAQ →</Link></li>
            </ul>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  );
}
