import { z } from 'zod';

export const IsoDateTime = z.string().datetime({ offset: true });
export type IsoDateTime = z.infer<typeof IsoDateTime>;

export const AutonomyLevel = z.enum([
  'ASK',
  'ASSIST',
  'EXECUTE',
  'AUTONOMOUS',
  'P99',
]);
export type AutonomyLevel = z.infer<typeof AutonomyLevel>;

export const RouterMode = z.enum([
  'FREE',
  'PRIVATE',
  'BALANCED',
  'FAST',
  'QUALITY',
  'P99',
]);
export type RouterMode = z.infer<typeof RouterMode>;

export const PrivacyClass = z.enum([
  'PUBLIC',
  'INTERNAL',
  'CONFIDENTIAL',
  'SECRET',
]);
export type PrivacyClass = z.infer<typeof PrivacyClass>;

/**
 * Risk categories used by the Guardian and by every tool descriptor.
 * See docs/adr/0003-god-claw-execution-boundary.md.
 */
export const RiskCategory = z.enum([
  'READ',
  'WRITE',
  'EXECUTE',
  'NETWORK',
  'SECRET',
  'DEPLOYMENT',
  'DESTRUCTIVE',
  'FINANCIAL',
  'EXTERNAL_COMMUNICATION',
  'PRIVILEGED',
]);
export type RiskCategory = z.infer<typeof RiskCategory>;

export const RiskLevel = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type RiskLevel = z.infer<typeof RiskLevel>;

/**
 * Content classification used to gate prompt injection defence.
 * See docs/THREAT-MODEL.md §T1.
 */
export const ContentTrust = z.enum([
  'SYSTEM_POLICY',
  'DEVELOPER_INSTRUCTION',
  'USER_INTENT',
  'TRUSTED_PROJECT_CONFIG',
  'UNTRUSTED_CONTENT',
]);
export type ContentTrust = z.infer<typeof ContentTrust>;

export const Money = z.object({
  currency: z.enum(['USD', 'EUR']).default('USD'),
  microcents: z.bigint().nonnegative(), // 1 USD = 100 * 1_000_000 microcents
});
export type Money = z.infer<typeof Money>;

export const Budget = z.object({
  maxCost: Money.optional(),
  maxTokens: z.number().int().positive().optional(),
  maxRuntimeMs: z.number().int().positive().optional(),
  maxAgentRuns: z.number().int().positive().optional(),
  maxToolCalls: z.number().int().positive().optional(),
  allowedProviderIds: z.array(z.string()).optional(),
});
export type Budget = z.infer<typeof Budget>;
