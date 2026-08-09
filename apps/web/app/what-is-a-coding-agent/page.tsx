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

const URL = pageUrl('/what-is-a-coding-agent');
const TITLE = 'What is an AI coding agent?';
const DESCRIPTION =
  'An AI coding agent is an autonomous software system that reads a goal, plans code changes, executes them in a controlled environment, and produces evidence its work satisfies acceptance criteria. Defined precisely, distinguished from code completion, and mapped to a real runtime.';

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
    'AI coding agent',
    'coding agent',
    'autonomous coding agent',
    'AI software engineer',
    'agentic coding',
    'AI programmer',
    'autonomous developer',
  ],
};

export default function Page() {
  return (
    <>
      <JsonLd
        data={definedTermLd({
          name: 'AI coding agent',
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
          { name: 'What is an AI coding agent?', url: URL },
        ])}
      />
      <Nav />
      <main id="main-content" className="container">
        <article>
          <header className="hero">
            <p className="eyebrow">Definition</p>
            <h1>What is an AI coding agent?</h1>
            <p className="lede">
              A precise definition that separates real autonomous coding
              agents from code completion, chat wrappers, and demo videos.
            </p>
          </header>

          <section className="section" aria-labelledby="short">
            <h2 id="short">The short answer</h2>
            <p className="answer">
              <strong>
                An AI coding agent is an autonomous software system that
                receives a goal in natural language, plans code changes
                as a sequence of steps, executes those steps against a
                real codebase and toolchain in a controlled environment,
                and produces evidence that its work satisfies the goal's
                acceptance criteria.
              </strong>{' '}
              The critical word is <em>autonomous</em>: the agent decides
              which files to read, which commands to run, when to iterate,
              and when to stop — without a human operating each step.
            </p>
          </section>

          <section className="section" aria-labelledby="properties">
            <h2 id="properties">Properties of a real coding agent</h2>
            <ol className="steps">
              <li>
                <strong>Goal-directed.</strong> Accepts a natural-language
                goal, produces a plan to achieve it, and revises the plan
                as it learns from the codebase.
              </li>
              <li>
                <strong>Environment-grounded.</strong> Reads the actual
                codebase — file tree, imports, tests, docs — before
                proposing changes. Does not hallucinate structure.
              </li>
              <li>
                <strong>Tool-using.</strong> Invokes real tools: file
                read/write, Git, package manager, test runner, linter,
                type checker, browser, HTTP. Every tool call is typed
                and permissioned.
              </li>
              <li>
                <strong>Iterative.</strong> Runs a change, observes the
                result (tests, type errors, logs), and revises.
              </li>
              <li>
                <strong>Evidence-producing.</strong> Emits inspectable
                artifacts: diffs, test output, coverage, security scan
                results. A claim of &ldquo;done&rdquo; without evidence
                is not real completion.
              </li>
              <li>
                <strong>Bounded.</strong> Runs under budget, timeout,
                retry, and delegation-depth limits so autonomy does not
                become runaway.
              </li>
              <li>
                <strong>Policy-controlled.</strong> Destructive, financial,
                external-communication, and privileged actions require
                approval — the agent proposes, the operator approves.
              </li>
              <li>
                <strong>Recoverable.</strong> If the machine dies mid-work,
                another worker resumes from durable state without the
                operator restarting from scratch.
              </li>
            </ol>
          </section>

          <section className="section" aria-labelledby="not-agents">
            <h2 id="not-agents">What is not a coding agent</h2>
            <div className="grid">
              <Card
                title="Code completion"
                body="Inline suggestions (Copilot, TabNine, Codeium) predict the next tokens as you type. They are not agents — they do not plan, execute, or produce evidence."
              />
              <Card
                title="Chat with a code editor tab"
                body="A chat interface that shows a diff for you to accept is not autonomous. If the human decides every step, the system is a copilot, not an agent."
              />
              <Card
                title="Task queue with an LLM in the loop"
                body="A background job that calls an LLM once and commits the output is a scripted workflow, not an agent. Agents plan, iterate, and revise."
              />
              <Card
                title="Demo video"
                body="A one-shot happy-path recording proves nothing about durability, recovery, or evidence. Real agents run under crash conditions, not stage lighting."
              />
            </div>
          </section>

          <section className="section" aria-labelledby="specialisation">
            <h2 id="specialisation">Specialist roles inside a coding swarm</h2>
            <p>
              Production coding agents are rarely one generalist. They are
              a swarm of specialists that collaborate through a shared
              mission runtime:
            </p>
            <ul className="link-list">
              <li><strong>Oracle</strong> — research: knows the ecosystem, cites documentation.</li>
              <li><strong>Architect</strong> — system design and constraints.</li>
              <li><strong>Planner</strong> — decomposes work into a task DAG.</li>
              <li><strong>Coder</strong> — implements: reads code, writes code, edits code.</li>
              <li><strong>Frontend / Backend / Database</strong> — layer-specific specialists.</li>
              <li><strong>QA</strong> — writes and runs tests, reports coverage.</li>
              <li><strong>Browser</strong> — drives real browsers for E2E.</li>
              <li><strong>Security</strong> — reviews for injection, secrets, unsafe defaults.</li>
              <li><strong>DevOps / SRE</strong> — deployment, observability, on-call.</li>
              <li><strong>Reviewer / Critic / Judge</strong> — independent evaluation of proposed work.</li>
              <li><strong>Guardian</strong> — policy enforcement across every specialist.</li>
            </ul>
          </section>

          <section className="section" aria-labelledby="runtime-required">
            <h2 id="runtime-required">Why a coding agent needs a runtime</h2>
            <p>
              A coding agent without a durable runtime is a demo. Real
              agent work must survive: worker crashes, network partitions,
              transient tool failures, model provider outages, malicious
              input, and multi-hour missions that span operator sleep
              schedules. The runtime is what makes that survival possible.
            </p>
            <p>
              See{' '}
              <Link href="/what-is-agentic-development-os">
                What is an Agentic Development OS?
              </Link>{' '}
              for the required properties of that runtime, and{' '}
              <Link href="/god">GOD Machine</Link> for one implementation.
            </p>
          </section>

          <section className="section" aria-labelledby="see-also">
            <h2 id="see-also">See also</h2>
            <ul className="link-list">
              <li><Link href="/what-is-agentic-development-os">What is an Agentic Development OS? →</Link></li>
              <li><Link href="/god">GOD Machine — full product overview →</Link></li>
              <li><Link href="/comparisons">Compare AI coding agents →</Link></li>
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
