/**
 * Single source of truth for the marketing surface's identity metadata.
 * Every page's OG tags, canonical URLs, JSON-LD, and human-readable copy
 * should thread through this module.
 */

export const SITE = {
  name: 'GOD Machine',
  legalName: 'The Omnipotent G.O.D Machine',
  brand: 'CodingAgent / GOD',
  tagline: 'Open Agentic Development OS',
  description:
    'GOD Machine is the open-source Agentic Development Operating System — autonomous coding agents, MCP tools, local LLM routing, secure sandboxes, persistent memory, coding IDE, P99 verification, deployment and self-healing workflows. Local-first, self-hosted, model-agnostic, sovereign.',
  shortDescription:
    'The Open Agentic Development OS. Think. Build. Execute. Verify. Deploy. Repair.',
  url: 'https://codingagent.in/god',
  origin: 'https://codingagent.in',
  githubUrl:
    'https://github.com/CodesbyFebin/The-Omnipotent-G.O.D-Machine-',
  ogImage: 'https://github.com/user-attachments/assets/d48e0bd5-dc88-4e82-bbcf-97c294e735d1',
  authorName: 'CodingAgent',
  authorUrl: 'https://codingagent.in',
  twitterHandle: '@codingagent',
  keywords: [
    'AI coding agent',
    'open-source AI coding agent',
    'autonomous coding agent',
    'self-hosted coding agent',
    'agentic IDE',
    'open-source agentic IDE',
    'AI software engineer',
    'autonomous software engineering',
    'multi-agent coding',
    'agent swarm',
    'local LLM coding agent',
    'Ollama coding agent',
    'MCP coding agent',
    'Model Context Protocol',
    'LLM router',
    'self-hosted LLM gateway',
    'secure AI agents',
    'sandboxed coding agent',
    'AI DevOps agent',
    'agentic development OS',
    'sovereign AI development',
    'durable mission runtime',
    'evidence-driven verification',
    'self-healing software',
  ],
} as const;

export function pageUrl(pathname: string): string {
  const path = pathname === '/' ? '' : pathname;
  return `${SITE.origin}${path}`;
}
