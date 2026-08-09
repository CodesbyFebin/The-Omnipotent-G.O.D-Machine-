import Link from 'next/link';
import { Footer, Nav } from './_components/nav';

export default function HomePage() {
  return (
    <>
      <Nav />
      <main className="container">
        <section className="hero">
          <h1>GOD Machine</h1>
          <p className="lede">
            The sovereign runtime connecting intelligence, agents, tools,
            autonomous workers, models, sandboxes and distributed compute into
            one verified execution system.
          </p>
          <p className="chain">
            <b>Think</b> → <b>Build</b> → <b>Execute</b> → <b>Verify</b> →{' '}
            <b>Deploy</b> → <b>Repair</b>
          </p>
          <div className="cta-row">
            <Link href="/god" className="btn btn-primary">
              Enter GOD →
            </Link>
            <a
              href="https://github.com/CodesbyFebin/The-Omnipotent-G.O.D-Machine-"
              className="btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </div>
        </section>

        <section className="section">
          <div className="status-banner">
            <strong>Phase 0.</strong> This project is under initial construction.
            No production capabilities are claimed. Every subsystem&apos;s real
            status lives in{' '}
            <code>docs/BUILD-TRACKER.md</code> in the repository. If it is not
            marked <code>VERIFIED</code> there, it is not production-ready.
          </div>
        </section>

        <section className="section">
          <h2>The kernel</h2>
          <div className="grid">
            <Card
              title="GOD Machine"
              body="Sovereign runtime: missions, workspaces, agents, tools, sandboxes, deployments, observability."
              status="in-progress"
            />
            <Card
              title="GOD Mode"
              body="Maximum-autonomy operating mode with per-mission autonomy levels: ASK, ASSIST, EXECUTE, AUTONOMOUS, P99."
              status="todo"
            />
            <Card
              title="GOD Brain"
              body="Intent compiler, planner, decomposer, agent selector, budget controller, reflection engine."
              status="todo"
            />
            <Card
              title="GOD Claw"
              body="Sole execution authority. Every filesystem, terminal, Git, HTTP, database, deployment call goes through Claw."
              status="todo"
            />
            <Card
              title="GOD Router"
              body="Provider-agnostic model routing. Local, edge, free, paid. FREE mode never silently escalates."
              status="todo"
            />
            <Card
              title="GOD Memory"
              body="Six persistent memory layers, from active task context to organization knowledge, all retrieval-selective."
              status="todo"
            />
            <Card
              title="GOD Guardian"
              body="Policy, identity, human-approval plane. Secrets never enter model prompts."
              status="todo"
            />
            <Card
              title="P99"
              body="Verification engine. A mission cannot be VERIFIED without evidence for every required gate."
              status="todo"
            />
          </div>
        </section>

        <section className="section">
          <h2>Design principles</h2>
          <div className="grid">
            <Card
              title="Sovereignty"
              body="Local-first and self-hostable. The core runs without our cloud."
            />
            <Card
              title="Model independence"
              body="No vendor is required. Providers are plugins scored by fit and privacy."
            />
            <Card
              title="Evidence-backed autonomy"
              body="Autonomy without proof is unsafe. P99 gates produce evidence artifacts, never vibes."
            />
            <Card
              title="Six primitives"
              body="Agent, Tool, Worker, Node, Mission, Evidence. Everything else is derived."
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function Card({
  title,
  body,
  status,
}: {
  title: string;
  body: string;
  status?: 'todo' | 'in-progress' | 'verified';
}) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{body}</p>
      {status === 'todo' && <span className="tag tag-todo">Not yet built</span>}
      {status === 'in-progress' && (
        <span className="tag tag-progress">Phase 0</span>
      )}
      {status === 'verified' && (
        <span className="tag tag-verified">Verified</span>
      )}
    </article>
  );
}
