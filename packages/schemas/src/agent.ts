import { z } from 'zod';
import { AgentId, ToolId } from './ids';
import { Budget, RouterMode } from './common';

/**
 * Built-in agent roles. Custom agents are represented as `custom` and carry
 * their role definition in `AgentDefinition`.
 */
export const AgentRole = z.enum([
  'oracle',
  'planner',
  'architect',
  'frontend',
  'backend',
  'database',
  'coder',
  'reviewer',
  'security',
  'qa',
  'browser',
  'devops',
  'sre',
  'performance',
  'documentation',
  'judge',
  'guardian',
  'custom',
]);
export type AgentRole = z.infer<typeof AgentRole>;

export const AgentModelPolicy = z.object({
  routerMode: RouterMode.default('BALANCED'),
  /** Provider IDs the router may pick from. Empty = router default. */
  allowedProviderIds: z.array(z.string()).default([]),
  /** Provider IDs the router must never pick, even if `allowedProviderIds` is empty. */
  deniedProviderIds: z.array(z.string()).default([]),
});
export type AgentModelPolicy = z.infer<typeof AgentModelPolicy>;

export const AgentDefinition = z.object({
  id: AgentId,
  role: AgentRole,
  name: z.string().min(1),
  systemInstruction: z.string().min(1),
  goal: z.string().min(1),
  toolIds: z.array(ToolId).default([]),
  modelPolicy: AgentModelPolicy,
  budget: Budget.optional(),
  /**
   * Maximum depth of subagents this agent may spawn. Independently capped by
   * mission-level and org-level limits.
   */
  maxSubagentDepth: z.number().int().nonnegative().default(2),
  timeoutMs: z.number().int().positive().default(600_000),
  /** JSON Schema describing the shape of a completed `AgentRun.output`. */
  outputSchema: z.record(z.string(), z.unknown()).optional(),
});
export type AgentDefinition = z.infer<typeof AgentDefinition>;
