import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Nav } from '../_components/nav';
import { JsonLd, articleLd, breadcrumbLd } from '../_lib/jsonld';
import { SITE, pageUrl } from '../_lib/site';

const URL = pageUrl('/comparisons');
const TITLE =
  'GOD Machine vs Cursor, Cline, OpenHands, GitHub Copilot, and others';
const DESCRIPTION =
  'How GOD Machine compares to Cursor, Cline, OpenHands, GitHub Copilot, Aider, Devin, and similar AI coding tools — categorically, honestly, and without pretending to be what it is not.';

export const metadata: Metadata = {
  title: 'Comparisons — GOD Machine vs Cursor, Cline, OpenHands, Copilot',
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: 'article',
  },
  keywords: [
    'GOD Machine vs Cursor',
    'GOD Machine vs Cline',
    'GOD Machine vs OpenHands',
    'GOD Machine vs GitHub Copilot',
    'agentic IDE comparison',
    'AI coding agent comparison',
    'best self-hosted coding agent',
  ],
};

const ROWS = [
  {
    axis: 'Category',
    god: 'Agentic Development OS (runtime)',
    cursor: 'AI-augmented editor',
    cline: 'Agentic coding extension for VS Code',
    openhands: 'Self-hosted agent environment',
    copilot: 'Inline code completion + chat',
  },
  {
    axis: 'Self-hosted',
    god: 'First-class — the core runs without any hosted service',
    cursor: 'No — desktop client, hosted backend',
    cline: 'Yes — runs in your VS Code with your keys',
    openhands: 'Yes — self-host is the default',
    copilot: 'No — GitHub-hosted',
  },
  {
    axis: 'License',
    god: 'Apache-2.0',
    cursor: 'Proprietary',
    cline: 'Apache-2.0',
    openhands: 'MIT',
    copilot: 'Proprietary',
  },
  {
    axis: 'Model provider policy',
    god: 'Any (local Ollama, OpenAI-compatible, Anthropic). Router scores per request. FREE mode never silently escalates.',
    cursor: 'Vendor-mediated',
    cline: 'BYOK across many providers',
    openhands: 'BYOK / self-hosted models',
    copilot: 'GitHub-mediated (OpenAI, Anthropic, others)',
  },
  {
    axis: 'Multi-agent swarm',
    god: 'Yes — Architect, Coder, Reviewer, Security, QA, DevOps, Browser, SRE, Guardian roles collaborate',
    cursor: 'Single agent',
    cline: 'Sub-agents supported',
    openhands: 'Single agent with tool loops',
    copilot: 'Single agent (chat mode)',
  },
  {
    axis: 'Durable mission runtime',
    god: 'Yes — missions and tasks live in Postgres, worker leases with expiry and reclamation, survive process restart',
    cursor: 'Session-scoped',
    cline: 'Session-scoped',
    openhands: 'Session-scoped',
    copilot: 'Session-scoped',
  },
  {
    axis: 'Tenant isolation',
    god: 'Row-level security enforced at the database with FORCE + non-superuser role demotion',
    cursor: 'Vendor-controlled',
    cline: 'Single-user (your local machine)',
    openhands: 'Deployment-scoped',
    copilot: 'GitHub-mediated',
  },
  {
    axis: 'Evidence-driven verification',
    god: 'P99 engine — mission SUCCEEDED does not mean VERIFIED; independent gates produce evidence artifacts',
    cursor: 'Tests run on request',
    cline: 'Tests run on request',
    openhands: 'Tests run on request',
    copilot: 'Tests run on request',
  },
  {
    axis: 'Tool boundary',
    god: 'GOD Claw — single execution authority; every tool call is typed, permissioned, sandboxed, audited',
    cursor: 'Editor-mediated',
    cline: 'Approval per action',
    openhands: 'Container-scoped',
    copilot: 'Editor + hosted tools',
  },
  {
    axis: 'Sandboxing',
    god: 'Docker (default), Firecracker, WASM, K8s namespaces — matched to risk class',
    cursor: 'Editor process',
    cline: 'Local machine (no sandbox by default)',
    openhands: 'Docker (default)',
    copilot: 'GitHub Codespaces / local',
  },
  {
    axis: 'Deployment automation',
    god: 'Yes — adapter pattern with policy, health checks, rollback readiness',
    cursor: 'External',
    cline: 'External',
    openhands: 'Via tools',
    copilot: 'External',
  },
  {
    axis: 'Self-healing',
    god: 'Planned as a first-class subsystem (M5): observe → diagnose → repair → canary → promote/rollback',
    cursor: 'External',
    cline: 'External',
    openhands: 'External',
    copilot: 'External',
  },
  {
    axis: 'MCP native',
    god: 'Yes — MCP tools registered with per-org permissions, same Guardian evaluation as built-in tools',
    cursor: 'MCP support',
    cline: 'MCP support',
    openhands: 'MCP support',
    copilot: 'Limited',
  },
  {
    axis: 'Distributed compute (EdgeNodes)',
    god: 'Planned — trust-tiered nodes; private repos never scheduled to untrusted nodes',
    cursor: 'No',
    cline: 'No',
    openhands: 'No',
    copilot: 'No',
  },
  {
    axis: 'Where it excels today',
    god: 'Substrate and security architecture. Foundation shipped as v0.1.0-rc1.',
    cursor: 'Best-in-class editor UX',
    cline: 'Fast in-editor iteration with your models',
    openhands: 'Solid CLI + browser agent, mature',
    copilot: 'Ubiquity, GitHub-native ergonomics',
  },
] as const;

export default function Page() {
  return (
    <>
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
          { name: 'Comparisons', url: URL },
        ])}
      />
      <Nav />
      <main id="main-content" className="container">
        <article>
          <header className="hero">
            <p className="eyebrow">Comparisons</p>
            <h1>How GOD Machine compares</h1>
            <p className="lede">
              A category-honest comparison of GOD Machine, Cursor, Cline,
              OpenHands, and GitHub Copilot. These are different products
              solving different problems — the point is to make the
              differences legible.
            </p>
          </header>

          <section className="section" aria-labelledby="honesty">
            <h2 id="honesty">Read this first</h2>
            <p>
              These tools are not competitors in the strict sense. Cursor
              is a superb AI-augmented editor. Cline is an excellent
              in-editor agent with your keys. OpenHands is a mature
              self-hosted agent environment. GitHub Copilot is the
              most-installed AI programming assistant in the world. GOD
              Machine is an <strong>Agentic Development Operating
              System</strong> — a runtime layer that agents plug into.
              It is intentionally different in shape.
            </p>
            <p>
              This page compares them across axes that matter for
              autonomous engineering work: durability, isolation,
              verification, sovereignty. It does not compare axes GOD
              Machine does not attempt to compete on (in-editor UX,
              inline suggestions, GitHub integration polish).
            </p>
          </section>

          <section className="section" aria-labelledby="table">
            <h2 id="table">Side-by-side matrix</h2>
            <div className="table-scroll">
              <table className="compare">
                <thead>
                  <tr>
                    <th scope="col">Axis</th>
                    <th scope="col">GOD Machine</th>
                    <th scope="col">Cursor</th>
                    <th scope="col">Cline</th>
                    <th scope="col">OpenHands</th>
                    <th scope="col">GitHub Copilot</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.axis}>
                      <th scope="row">{row.axis}</th>
                      <td>{row.god}</td>
                      <td>{row.cursor}</td>
                      <td>{row.cline}</td>
                      <td>{row.openhands}</td>
                      <td>{row.copilot}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="section" aria-labelledby="when">
            <h2 id="when">When to reach for each</h2>
            <div className="grid">
              <Card
                title="Reach for GOD Machine when…"
                body="You need autonomous work to run unattended, survive worker crashes, produce inspectable evidence, respect tenant isolation, and run on infrastructure you control end-to-end. Enterprise self-hosting, long-running missions, multi-agent coordination, evidence-driven verification."
              />
              <Card
                title="Reach for Cursor when…"
                body="You want the best day-to-day editing experience with strong AI assistance and don't need to run agents unattended on infrastructure you control."
              />
              <Card
                title="Reach for Cline when…"
                body="You already live in VS Code, want an agent that uses your own model keys, and are comfortable operating an interactive agent per task."
              />
              <Card
                title="Reach for OpenHands when…"
                body="You want a mature self-hosted single-agent environment with CLI and browser control, and multi-tenancy at the database layer isn't a first-class requirement."
              />
              <Card
                title="Reach for Copilot when…"
                body="You want the most ubiquitous inline suggestions, tight GitHub integration, and can defer sovereignty concerns."
              />
              <Card
                title="Use several together"
                body="GOD Machine's runtime coexists with any editor-first agent. The runtime handles unattended and evidence-heavy work; your editor handles interactive iteration."
              />
            </div>
          </section>

          <section className="section" aria-labelledby="what-not">
            <h2 id="what-not">What GOD Machine does NOT claim</h2>
            <ul className="link-list">
              <li>We do not claim the best in-editor UX — Cursor and JetBrains AI are ahead there.</li>
              <li>We do not claim ubiquity — Copilot is installed on more machines than any AI coding tool.</li>
              <li>We do not claim finished features. See <a href={`${SITE.githubUrl}/blob/main/docs/BUILD-TRACKER.md`} target="_blank" rel="noopener noreferrer">docs/BUILD-TRACKER.md</a> — every subsystem's status is explicit.</li>
              <li>We do not claim proprietary model breakthroughs. GOD Machine is the runtime, not the model.</li>
            </ul>
          </section>

          <section className="section" aria-labelledby="deeper">
            <h2 id="deeper">Deeper reading</h2>
            <ul className="link-list">
              <li><Link href="/what-is-agentic-development-os">What is an Agentic Development OS? →</Link></li>
              <li><Link href="/what-is-a-coding-agent">What is an AI coding agent? →</Link></li>
              <li><Link href="/god">GOD Machine — full product overview →</Link></li>
              <li><Link href="/security">Security architecture →</Link></li>
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
