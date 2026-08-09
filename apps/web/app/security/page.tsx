import type { Metadata } from 'next';
import Link from 'next/link';
import { Footer, Nav } from '../_components/nav';
import { JsonLd, articleLd, breadcrumbLd } from '../_lib/jsonld';
import { SITE, pageUrl } from '../_lib/site';

const URL = pageUrl('/security');
const TITLE = 'GOD Machine — Security architecture';
const DESCRIPTION =
  'GOD Machine\'s security architecture: threat model, row-level tenant isolation, non-superuser role demotion, sandboxed execution, secret isolation, credential brokering, prompt-injection defense, and append-only audit chain.';

export const metadata: Metadata = {
  title: 'Security',
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    type: 'article',
  },
  keywords: [
    'AI coding agent security',
    'agentic AI security architecture',
    'row-level security AI agent',
    'sandboxed coding agent',
    'prompt injection defense',
    'secure AI agents',
    'AI agent threat model',
  ],
};

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
          { name: 'Security', url: URL },
        ])}
      />
      <Nav />
      <main id="main-content" className="container">
        <article>
          <header className="hero">
            <p className="eyebrow">Security</p>
            <h1>Security architecture</h1>
            <p className="lede">
              An honest description of the security model, threat model,
              and controls — what is enforced today at v0.1.0-rc1, what
              lands with the durable runtime, and what is deliberately
              deferred.
            </p>
          </header>

          <section className="section" aria-labelledby="threat-model">
            <h2 id="threat-model">The threat model</h2>
            <p>
              Autonomous agents amplify normal application threats and add
              new ones. GOD Machine is designed against a specific set of
              adversaries — the full list lives in{' '}
              <a
                href={`${SITE.githubUrl}/blob/main/docs/THREAT-MODEL.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                docs/THREAT-MODEL.md
              </a>
              . Summary:
            </p>
            <ul className="link-list">
              <li>External unauthenticated attacker (SSRF, credential stuffing, DoS).</li>
              <li>Malicious authenticated user (cross-tenant reads, privilege escalation, cost abuse).</li>
              <li>Compromised model provider (adversarial completions, prompt-injected tool calls).</li>
              <li>Malicious repository (poisoned READMEs, malicious postinstall scripts, tests that run harmful commands).</li>
              <li>Malicious MCP server (exfiltrating tools, poisoned outputs).</li>
              <li>Malicious EdgeNode operator (reading workloads, tampering with outputs).</li>
              <li>Malicious dependency (supply chain, typosquatting, transitive attacks).</li>
              <li>Insider (compromised maintainer commits).</li>
              <li>Physical adversary with device access.</li>
            </ul>
          </section>

          <section className="section" aria-labelledby="live">
            <h2 id="live">What is enforced today (v0.1.0-rc1)</h2>
            <ol className="steps">
              <li>
                <strong>Row-level tenant isolation at the database.</strong>{' '}
                Every org-scoped table has RLS enabled and <em>forced</em>{' '}
                — even the table owner is subject to the policies.
                Application code demotes to a non-superuser <code>god_app</code>{' '}
                role per authenticated transaction via <code>SET LOCAL ROLE</code>,
                so a missed application-layer authz check still fails safe
                at the database.
              </li>
              <li>
                <strong>argon2id password hashing.</strong> OWASP 2023
                minimum parameters, via the Rust-backed <code>@node-rs/argon2</code>{' '}
                binding.
              </li>
              <li>
                <strong>DB-backed opaque sessions.</strong> 256-bit random
                tokens, stored SHA-256-hashed at rest. Revocable. A
                database read alone cannot impersonate a user.
              </li>
              <li>
                <strong><code>__Host-</code>-prefixed session cookie.</strong>{' '}
                HttpOnly, SameSite=Lax, Secure in production, no Domain
                attribute — defence against subdomain cookie injection.
              </li>
              <li>
                <strong>Append-only aggregate-scoped audit log.</strong>{' '}
                Every state change writes an event in the same transaction.
                UPDATE and DELETE on <code>audit_events</code> are denied
                at the RLS layer. Chains per aggregate (mission_run,
                task_run, task_attempt, task_lease) so two runs of the
                same mission never share a chain.
              </li>
              <li>
                <strong>Server-side authorization guards.</strong> Layout
                redirects are not the boundary — <code>requireUser</code>,
                <code>requireOrgMembership</code>, <code>requireOrgRole</code>,
                <code>requireProjectAccess</code>, and{' '}
                <code>requireMissionAccess</code> guards run against a
                user-scoped transaction so RLS enforces even if the guard
                has a bug. 404 (not 403) on forbidden — existence never
                leaks.
              </li>
              <li>
                <strong>In-process token-bucket rate limits</strong> on
                every auth endpoint (per IP + endpoint). Redis-backed
                limits land with the worker runtime.
              </li>
              <li>
                <strong>Security headers.</strong>{' '}
                <code>X-Content-Type-Options</code>,{' '}
                <code>X-Frame-Options</code>, <code>Referrer-Policy</code>,{' '}
                <code>Permissions-Policy</code>, powered-by header off.
              </li>
              <li>
                <strong>Integration CI runs the full RLS matrix.</strong>{' '}
                Cross-org denial for SELECT/INSERT/UPDATE on every
                org-scoped table. Append-only enforcement asserted at the
                database layer, not the application layer.
              </li>
              <li>
                <strong>Secret handling.</strong> Secrets never appear in
                event payloads, prompts, or logs. Tools that need
                credentials receive credential handles (Phase 2A pattern);
                the broker resolves them inside the sandbox.
              </li>
            </ol>
          </section>

          <section className="section" aria-labelledby="planned">
            <h2 id="planned">What lands with the durable runtime and Claw</h2>
            <ol className="steps">
              <li>
                <strong>GOD Claw as the sole execution authority.</strong>{' '}
                No agent can touch the filesystem, terminal, Git, HTTP,
                database, browser, Docker, SSH, or a deployment target
                except through Claw's typed tool contracts. Every request
                is classified (READ, WRITE, EXECUTE, NETWORK, SECRET,
                DEPLOYMENT, DESTRUCTIVE, FINANCIAL, EXTERNAL_COMMUNICATION,
                PRIVILEGED), gated by policy, sandboxed, and audited.
              </li>
              <li>
                <strong>Sandbox tiering.</strong> Docker (default),
                Firecracker (hostile-code), gVisor, WASM/WASI
                (deterministic low-privilege), K8s namespaces (shared
                cluster). Each sandbox receives only what the task needs.
                No root by default.
              </li>
              <li>
                <strong>Idempotency broker.</strong> First-writer-wins
                deduplication of every executor side effect via
                SHA-256 hashes of{' '}
                <code>(mission_run_id, task_run_id, attempt_number, effect_scope)</code>.
                A retry never fires a side effect twice.
              </li>
              <li>
                <strong>Prompt-injection defense.</strong> Repository
                content, tool outputs, web pages, and documentation are
                labeled <code>UNTRUSTED_CONTENT</code> and cannot override{' '}
                <code>SYSTEM_POLICY</code>,{' '}
                <code>DEVELOPER_INSTRUCTION</code>,{' '}
                <code>USER_INTENT</code>, or{' '}
                <code>TRUSTED_PROJECT_CONFIG</code>. Destructive and
                financial tool calls require per-call approval whenever
                the originating input touches untrusted content.
              </li>
              <li>
                <strong>Worker ownership rule.</strong> A worker holding a
                task ID proves nothing. Claim authorization requires all
                four of: tenant context on the transaction, task
                eligibility, successful UNIQUE-constrained lease insert
                (races lost here mean someone else owns it), and policy
                check via <code>god_app</code> demotion. This becomes
                load-bearing once distributed EdgeNodes exist.
              </li>
              <li>
                <strong>Human-approval UX.</strong> Every approval prompt
                names who, why, what, on what resource, what could change,
                what permissions, and whether it is reversible. No dark
                patterns.
              </li>
              <li>
                <strong>SSRF and metadata protection.</strong> HTTP tools
                get per-mission URL allowlists; private, loopback,
                link-local, and cloud-metadata IPs are denied by default;
                DNS re-resolution is checked to prevent rebinding.
              </li>
              <li>
                <strong>Trust-tiered EdgeNodes.</strong>{' '}
                <code>TRUSTED_PERSONAL</code>,{' '}
                <code>TRUSTED_ORGANIZATION</code>,{' '}
                <code>COMMUNITY</code>, <code>QUARANTINED</code>. Private
                repositories are never scheduled to untrusted nodes.
              </li>
            </ol>
          </section>

          <section className="section" aria-labelledby="reporting">
            <h2 id="reporting">Reporting a vulnerability</h2>
            <p>
              Do not open a public issue for a security vulnerability.
              Use the security-advisory flow on the GitHub repository, or
              email <code>security@codingagent.in</code> once provisioned.
              Full policy in{' '}
              <a
                href={`${SITE.githubUrl}/blob/main/SECURITY.md`}
                target="_blank"
                rel="noopener noreferrer"
              >
                SECURITY.md
              </a>
              .
            </p>
          </section>

          <section className="section" aria-labelledby="see-also">
            <h2 id="see-also">Related</h2>
            <ul className="link-list">
              <li><a href={`${SITE.githubUrl}/blob/main/docs/THREAT-MODEL.md`} target="_blank" rel="noopener noreferrer">Full threat model on GitHub →</a></li>
              <li><a href={`${SITE.githubUrl}/blob/main/docs/adr/0003-god-claw-execution-boundary.md`} target="_blank" rel="noopener noreferrer">ADR-0003 — GOD Claw execution boundary →</a></li>
              <li><a href={`${SITE.githubUrl}/blob/main/docs/adr/0006-orm-and-auth.md`} target="_blank" rel="noopener noreferrer">ADR-0006 — auth architecture →</a></li>
              <li><a href={`${SITE.githubUrl}/blob/main/docs/adr/0007-durable-mission-runtime.md`} target="_blank" rel="noopener noreferrer">ADR-0007 — durable mission runtime and worker ownership rule →</a></li>
              <li><Link href="/faq">FAQ →</Link></li>
            </ul>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}
