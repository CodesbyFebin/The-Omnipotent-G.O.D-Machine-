# ADR-0003: GOD Claw — the sole execution boundary

**Status:** Accepted
**Date:** 2026-08-09
**Deciders:** Founding engineering

## Context

Agentic systems that give models direct access to shells, filesystems, HTTP,
Git, browsers, and cloud APIs have consistently produced incidents: rm -rf'd
homes, exfiltrated credentials, unauthorized deployments, prompt-injected
tool calls. The convenience of "give the model a shell" is inseparable from
these failure modes.

Options considered:

1. **Per-tool ad-hoc guards** — each tool defends itself.
2. **Runtime interception** — wrap tool calls in a middleware layer that logs
   and lets most through.
3. **Single execution authority (GOD Claw)** — no code path from an agent to
   any privileged operation exists except through Claw. Every request is
   typed, policy-evaluated, sandboxed, and audited.

## Decision

**Single execution authority.** Every tool that touches filesystem, network,
subprocess, Git, database, browser, HTTP, Docker, SSH, Kubernetes, cloud API,
package manager, or deployment provider is implemented as a tool descriptor
registered with GOD Claw. Agents may only *request* tools; they may not
*perform* actions.

Required request flow — enforced by architecture, not convention:

```
AGENT
  └── constructs typed ToolRequest
       └── posts to GOD Claw
            ├── schema validation
            ├── permission check against agent's scope
            ├── Guardian risk classification
            ├── approval resolution (per-call / per-mission / standing)
            ├── sandbox allocation
            ├── credential broker resolves any credential handles inside sandbox
            ├── execution
            ├── output capture + secret redaction
            ├── evidence artifact persistence
            └── audit event emission
```

Agents run in a process with **no** ambient authority: no filesystem write,
no network, no subprocess. The only outbound capability is `Claw.request(...)`.
This is enforced at the process level in production (sandboxed agent runtime),
not merely by API convention.

## Consequences

- Every new tool must ship with: input schema, output schema, permission
  descriptor, risk classification, timeout, retry policy, cost policy,
  credential policy, sandbox policy, audit policy. No exceptions. See the
  tool contract in `packages/tool-sdk`.
- A tool without a risk classification is unshippable. `LOW` is a
  classification and requires justification in the tool descriptor.
- Every tool call produces an audit event. Audit events are append-only.
  Losing an audit event is a P0 incident.
- Emergency stop: an org-level flag halts Claw execution for that org across
  all missions.
- Adding a new capability (a new kind of provider, a new browser action) does
  not add a new escape hatch. It adds a new tool descriptor.
- Testing: for every tool, a test asserts that calling it with a permission
  the agent does not hold returns `PermissionDenied` and produces no side
  effect.

## Non-negotiables

- The Guardian is a separate module from the agent runtime and does not itself
  invoke models. It is a rule + classifier engine over structured tool
  requests.
- Secrets never appear in tool inputs. Tools receive credential handles;
  the credential broker resolves them at execution time inside the sandbox.
- Approval UX shows: who, why, what tool, what resource, what could change,
  what permissions, what is the risk, is it reversible.

## Rejected alternatives

- **Per-tool guards:** rejected. Consistency across dozens of tools is
  unachievable; a single missed check is a full compromise.
- **Runtime interception middleware:** rejected. Interception is bypassable
  when tools are added later and register outside the middleware chain.

## Open questions this ADR does not resolve

- Whether Claw is a distinct process/binary from the agent runtime in Phase 4
  (probably yes; deferred until sandbox implementation is picked).
- The exact IPC between the agent runtime and Claw (deferred).
