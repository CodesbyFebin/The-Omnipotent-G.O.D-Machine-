# Security Policy

## Reporting a vulnerability

**Do not open a public issue for a security vulnerability.**

Email security reports to `security@codingagent.in`. If that address is not yet
provisioned (early Phase 0), open a private security advisory on the GitHub
repository instead.

Please include:

- A description of the vulnerability and its impact.
- Steps to reproduce (proof-of-concept if you have one).
- The commit hash or release version affected.
- Any suggested mitigations.

We aim to acknowledge reports within 3 business days and provide an initial
assessment within 10 business days. Coordinated disclosure timelines are set
per report, typically 90 days.

## Scope

In scope:

- Anything in this repository.
- Reference deployment configurations under `infrastructure/`.
- The Node runtime binary (once shipped).

Out of scope:

- Vulnerabilities requiring physical access to production hosts we do not
  operate.
- Self-hosted deployments configured against our documented guidance
  (e.g. disabling GOD Claw, exposing services without authentication).
- Third-party MCP servers, model providers, or EdgeNodes not shipped by us —
  report those to their maintainers.

## Threat model

See [`docs/THREAT-MODEL.md`](docs/THREAT-MODEL.md) for the authoritative list
of adversaries and controls. Any report that maps to an undefended threat in
that document is high-severity by default.

## Known caveats

This project is at **Phase 0**. Many controls named in the threat model are
not yet implemented — see [`docs/BUILD-TRACKER.md`](docs/BUILD-TRACKER.md).
Do not deploy to production data before the relevant items are marked
`VERIFIED`.

## Handling secrets

- Never commit secrets. `.gitignore` excludes `.env*` — do not override it.
- If you accidentally push a secret, rotate it first, then request history
  rewrite via a security report.
- The credential broker (Phase 4) is the only supported way to hand secrets
  to running missions. Do not paste secrets into missions, prompts, or issue
  comments.

## Supply chain

- Lockfiles are committed; installs use `--frozen-lockfile` in CI.
- Release artifacts will be signed starting Phase 14 (see tracker `P14-005`).
- Reviews from at least one maintainer are required for changes under
  `services/god-claw/`, `services/sandbox-manager/`, `services/god-router/`,
  and `packages/security-sdk/` once these directories exist.
