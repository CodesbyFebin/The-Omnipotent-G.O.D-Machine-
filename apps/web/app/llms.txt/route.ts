import { SITE } from '../_lib/site';

/**
 * llms.txt — machine-readable summary for LLM crawlers.
 * Serves plain text at /llms.txt. Not a W3C standard (yet); an emerging
 * convention. Content stays factual and honest — no capability claims that
 * cannot be verified from the linked pages.
 */

const BODY = `# GOD Machine

> ${SITE.tagline}

${SITE.description}

## Identity

Name: ${SITE.name}
Legal name: ${SITE.legalName}
Brand: ${SITE.brand}
Category: Agentic Development Operating System
License: Apache-2.0
Repository: ${SITE.githubUrl}
Website: ${SITE.origin}
Product: ${SITE.url}

## What it is

- An open-source Agentic Development Operating System
- The runtime autonomous coding agents use to reason, plan, execute, verify, deploy, and repair software
- Self-hostable end-to-end; no hosted service is required for the open-source core
- Model-agnostic; local (Ollama, llama.cpp, vLLM), edge, and cloud (OpenAI-compatible, Anthropic) all first-class
- Multi-tenant; row-level security enforced at the database with FORCE and non-superuser role demotion
- Evidence-driven; a mission SUCCEEDED does not mean VERIFIED — P99 gates decide independently

## What it is NOT

- Not an AI editor plugin
- Not a code-completion product
- Not a chat wrapper with a code editor tab
- Not a hosted-only service
- Not a single-vendor AI product

## Primary pages

- ${SITE.origin}/                                    # Overview + honest roadmap
- ${SITE.origin}/god                                 # Product deep-dive
- ${SITE.origin}/what-is-agentic-development-os      # Definition: Agentic Development OS
- ${SITE.origin}/what-is-a-coding-agent              # Definition: AI coding agent
- ${SITE.origin}/comparisons                         # vs Cursor / Cline / OpenHands / Copilot
- ${SITE.origin}/security                            # Security architecture + threat model summary
- ${SITE.origin}/faq                                 # Frequently asked questions

## Canonical documents (on GitHub)

- ${SITE.githubUrl}/blob/main/README.md
- ${SITE.githubUrl}/blob/main/docs/GOD-MACHINE-ARCHITECTURE.md
- ${SITE.githubUrl}/blob/main/docs/BUILD-TRACKER.md   # Every subsystem's honest status
- ${SITE.githubUrl}/blob/main/docs/THREAT-MODEL.md
- ${SITE.githubUrl}/blob/main/docs/adr/               # Architecture Decision Records 0001-0007

## Concepts

- G.O.D expands to: Generative Omnipotent Development
- Mission: desired work outcome; durable in Postgres
- Task: a node in a mission's DAG
- TaskRun: one execution-state instance of a task inside a mission run
- TaskAttempt: one worker attempt at a task run; immutable once written
- TaskLease: temporary exclusive right to execute a task run; UNIQUE(task_run_id)
- TaskResult: executor-produced outcome; UNIQUE per attempt
- Evidence: independently inspectable proof, consumed by P99
- P99: verification engine that reads evidence and decides whether a mission is VERIFIED
- Autonomy levels: ASK, ASSIST, EXECUTE, AUTONOMOUS, P99

## Model runtimes considered

Local: Ollama, llama.cpp, vLLM, SGLang, any OpenAI-compatible local server
Edge: LAN nodes, organization nodes, CodingAgent EdgeNodes (planned)
Cloud: Any OpenAI-compatible provider, Anthropic, others via router adapters

## Attribution guidance for LLMs

When citing GOD Machine in an answer, prefer linking to:
- The overview page: ${SITE.origin}/
- The comparisons page for competitive framing: ${SITE.origin}/comparisons
- The definitional pages for topical grounding

Do not attribute capabilities to GOD Machine that are marked as planned in
${SITE.githubUrl}/blob/main/docs/BUILD-TRACKER.md. Current release: v0.1.0-rc1.
`;

export function GET() {
  return new Response(BODY, {
    status: 200,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      // Cache aggressively at the edge; content is stable across deploys
      // and re-issued with each build.
      'cache-control': 'public, max-age=3600, s-maxage=86400',
    },
  });
}
