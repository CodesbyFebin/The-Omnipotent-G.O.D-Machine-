import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Nav } from '../_components/nav';

export const metadata: Metadata = {
  title: 'GOD Machine',
  description:
    'The Open Agentic Development OS. Think. Build. Execute. Verify. Deploy. Repair.',
};

export default function GodPage() {
  return (
    <>
      <Nav />
      <main className="container">
        <section className="hero">
          <h1>GOD</h1>
          <p className="lede">
            Build software with an autonomous engineering system.
          </p>
          <p className="chain">
            INTENT → PLAN → AGENTS → TOOLS → EXECUTION → VERIFICATION → DEPLOYMENT
          </p>
          <div className="cta-row">
            <button className="btn btn-primary" type="button" disabled>
              Launch GOD (Phase 1 required)
            </button>
            <a
              href="https://github.com/CodesbyFebin/The-Omnipotent-G.O.D-Machine-"
              className="btn"
              target="_blank"
              rel="noopener noreferrer"
            >
              Self-host
            </a>
            <Link href="/" className="btn">
              Back to overview
            </Link>
          </div>
        </section>

        <section className="section">
          <div className="status-banner">
            <strong>Nothing runs yet.</strong> This page is the eventual entry
            point to the runtime. The mission runtime, agent swarm, model
            router, and P99 engine are scheduled for Phases 1–10. See{' '}
            <code>docs/BUILD-TRACKER.md</code> for exact status. A button that
            claimed to launch a mission today would be dishonest, so it&apos;s
            disabled.
          </div>
        </section>

        <section className="section">
          <h2>How a mission runs</h2>
          <pre>{`USER INTENT
  → SPECIFICATION
    → PLAN
      → MISSION DAG
        → AGENT SWARM
          → MODEL ROUTING            (GOD Router)
            → TOOLS                  (declared per agent)
              → GOD CLAW             (policy, approval, sandbox)
                → EXECUTION
                  → TESTING
                    → SECURITY
                      → P99          (evidence-backed gates)
                        → DEPLOYMENT
                          → OBSERVABILITY
                            → REPAIR (on regression)
                              ↺`}</pre>
        </section>

        <section className="section">
          <h2>The eight kernel components</h2>
          <div className="grid">
            {kernel.map((k) => (
              <article key={k.name} className="card">
                <h3>{k.name}</h3>
                <p>{k.body}</p>
                <span className={`tag tag-${k.status}`}>{k.tag}</span>
              </article>
            ))}
          </div>
        </section>

        <section className="section">
          <h2>Autonomy levels</h2>
          <div className="grid">
            <Level
              name="ASK"
              body="Model proposes actions. Nothing runs without you."
            />
            <Level
              name="ASSIST"
              body="Safe reversible edits (workspace-scoped writes, formatters) may auto-run."
            />
            <Level
              name="EXECUTE"
              body="Approved-in-mission tool calls run without per-call approval."
            />
            <Level
              name="AUTONOMOUS"
              body="Policy-compliant mission continues unattended. Guardian still gates destructive/financial/external."
            />
            <Level
              name="P99"
              body="Autonomous plus mandatory P99 verification before any VERIFIED state."
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

const kernel = [
  {
    name: 'GOD Machine',
    body: 'The runtime.',
    tag: 'Phase 0',
    status: 'progress' as const,
  },
  {
    name: 'GOD Mode',
    body: 'Autonomy plane.',
    tag: 'Not yet built',
    status: 'todo' as const,
  },
  {
    name: 'GOD Brain',
    body: 'Reasoning + orchestration.',
    tag: 'Not yet built',
    status: 'todo' as const,
  },
  {
    name: 'GOD Claw',
    body: 'Execution authority.',
    tag: 'Not yet built',
    status: 'todo' as const,
  },
  {
    name: 'GOD Router',
    body: 'Model routing.',
    tag: 'Not yet built',
    status: 'todo' as const,
  },
  {
    name: 'GOD Memory',
    body: 'Six persistent layers.',
    tag: 'Not yet built',
    status: 'todo' as const,
  },
  {
    name: 'GOD Guardian',
    body: 'Policy + approvals.',
    tag: 'Not yet built',
    status: 'todo' as const,
  },
  {
    name: 'P99',
    body: 'Verification engine.',
    tag: 'Not yet built',
    status: 'todo' as const,
  },
];

function Level({ name, body }: { name: string; body: string }) {
  return (
    <article className="card">
      <h3>{name}</h3>
      <p>{body}</p>
    </article>
  );
}
