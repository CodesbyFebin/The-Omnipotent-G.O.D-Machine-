# ADR-0002: GOD Router — provider abstraction and routing

**Status:** Accepted
**Date:** 2026-08-09
**Deciders:** Founding engineering

## Context

The platform must not be bound to any single LLM vendor. Users must be able
to run entirely on local models, entirely on hosted models, or a mix. Route
selection is a policy problem (privacy, cost, latency, reliability) and a
capability problem (context length, tool calling, structured output).

Options considered:

1. **Adopt an existing gateway** (LiteLLM, OpenRouter, Portkey) as the router.
2. **Use vendor SDKs directly with a thin wrapper.**
3. **Build a first-party router with a provider adapter interface.**

## Decision

**Build a first-party router with a provider adapter interface.** Adapters may
internally call an existing gateway (an OpenAI-compatible endpoint is a
convenient fallback for many providers), but the routing logic — scoring,
fallback, budgeting, privacy enforcement, mode weighting — is ours.

Provider adapter contract:

```ts
interface ModelProvider {
  id: string;                                 // stable identifier
  listModels(): Promise<ModelDescriptor[]>;
  health(): Promise<ProviderHealth>;
  estimateCost(req: ModelRequest): Promise<CostEstimate>;
  capabilities(modelId: string): Capabilities; // context, tool calling, structured output, vision, privacy class
  chat(req: ChatRequest): Promise<ChatResponse>;
  stream(req: ChatRequest): AsyncIterable<ChatChunk>;
  structuredOutput<T>(req: StructuredRequest<T>): Promise<T>;
  toolCalling(req: ToolCallingRequest): Promise<ToolCallResponse>;
}
```

Routing is a **pure function** of:

- Task descriptor (type, complexity, required capabilities).
- Data privacy class of the mission.
- User mode (`FREE`, `PRIVATE`, `BALANCED`, `FAST`, `QUALITY`, `P99`).
- Organization policy (allowed/denied providers).
- Router state (provider health, historical success telemetry, current spend).

The scoring function is testable in isolation:

```
score(model) =
    (quality * task_fit * reliability * tool_calling * context_fit * privacy_score)
    /
    (cost * latency * (1 + failure_probability))
```

Weights are mode-dependent and configurable. See `services/god-router/src/scoring.ts`
(scheduled Phase 3).

## Consequences

- Users can add a new provider by shipping an adapter that satisfies the
  interface. No changes to router core required.
- The router owns fallback, circuit-breaking, retry, and budget enforcement.
  Adapters must not implement these — they'd be inconsistent per provider.
- `PRIVATE` mode enumerates its candidate set at mission start and stops if
  empty. It **never** silently escalates to a hosted provider.
- `FREE` mode's candidate set is `local ∪ user-edge-nodes ∪ free-tier providers`.
  Escalation to a paid provider requires an approval event.
- Every model call records: provider ID, model ID, privacy class, prompt
  token count, completion token count, cost estimate, actual cost when
  known, latency, success/failure. This telemetry feeds back into `reliability`
  and `failure_probability` for future scoring.
- The router is the only path from the platform to any model. Agents never
  hold provider API keys. Provider keys live in the credential broker and are
  resolved inside the router's process at call time.

## Rejected alternatives

- **Adopt LiteLLM as router:** rejected. LiteLLM is an excellent gateway and
  is a fine implementation detail behind one adapter, but delegating routing
  policy to a third-party's opinion mixes billing, privacy, and mode logic
  with someone else's roadmap.
- **Vendor SDKs directly:** rejected. Every consumer would reimplement
  fallback and budgeting.

## Open questions this ADR does not resolve

- Initial telemetry weighting when no history exists (cold start). Deferred
  to the Phase 3 implementation; likely: prior distribution from published
  benchmarks + rapid Bayesian update from live traffic.
- Exact circuit-breaker parameters. Deferred to Phase 3.
