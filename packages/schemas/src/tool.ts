import { z } from 'zod';
import { ToolId } from './ids';
import { Money, RiskCategory, RiskLevel } from './common';

/**
 * A Tool descriptor. Every tool passing through GOD Claw carries this
 * descriptor; no descriptor = the tool is not registered and cannot execute.
 * See docs/adr/0003-god-claw-execution-boundary.md.
 */

export const RetryPolicy = z.object({
  maxAttempts: z.number().int().min(1).default(1),
  backoffMs: z.number().int().nonnegative().default(0),
  jitter: z.boolean().default(false),
});
export type RetryPolicy = z.infer<typeof RetryPolicy>;

export const CostPolicy = z.object({
  /** Estimated worst-case cost per call. Zero for local operations. */
  perCallEstimate: Money.optional(),
});
export type CostPolicy = z.infer<typeof CostPolicy>;

export const CredentialPolicy = z.object({
  /**
   * Names of credential handles the tool requires. The broker resolves them
   * inside the sandbox at execution time; the tool never sees raw secrets in
   * its input.
   */
  requiredHandles: z.array(z.string()).default([]),
});
export type CredentialPolicy = z.infer<typeof CredentialPolicy>;

export const NetworkEgressPolicy = z.object({
  /** DNS names or exact CIDRs the sandbox may reach. Deny-by-default. */
  allowlist: z.array(z.string()).default([]),
  /** If true, cloud metadata endpoints (169.254.169.254, etc.) are always denied. */
  denyMetadataEndpoints: z.boolean().default(true),
});
export type NetworkEgressPolicy = z.infer<typeof NetworkEgressPolicy>;

export const FilesystemPolicy = z.object({
  /** Workspace-relative paths readable by the tool. */
  readPaths: z.array(z.string()).default([]),
  /** Workspace-relative paths writable by the tool. */
  writePaths: z.array(z.string()).default([]),
});
export type FilesystemPolicy = z.infer<typeof FilesystemPolicy>;

export const SandboxPolicy = z.object({
  /** Concrete implementations decided per deployment. */
  isolation: z.enum(['process', 'docker', 'firecracker', 'wasm', 'k8s']),
  cpuMilli: z.number().int().positive().default(1000),
  memoryMb: z.number().int().positive().default(512),
  diskMb: z.number().int().positive().default(1024),
  timeoutMs: z.number().int().positive().default(60_000),
  network: NetworkEgressPolicy,
  filesystem: FilesystemPolicy,
});
export type SandboxPolicy = z.infer<typeof SandboxPolicy>;

export const AuditPolicy = z.object({
  /** If true, redact tool output before persisting. Default is true. */
  redactOutput: z.boolean().default(true),
  /** If true, retain the raw output encrypted at rest for forensic use. */
  retainRawEncrypted: z.boolean().default(false),
});
export type AuditPolicy = z.infer<typeof AuditPolicy>;

export const ToolDescriptor = z.object({
  id: ToolId,
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'expected semver'),
  description: z.string().min(1),
  /** JSON Schema describing valid tool input. Validated at the runtime. */
  inputSchema: z.record(z.string(), z.unknown()),
  /** JSON Schema describing tool output. */
  outputSchema: z.record(z.string(), z.unknown()),
  /** Every risk category the tool touches. Multiple categories are allowed. */
  riskCategories: z.array(RiskCategory).min(1),
  /** Aggregate risk level. Guardian may still upgrade this based on inputs. */
  riskLevel: RiskLevel,
  retryPolicy: RetryPolicy,
  costPolicy: CostPolicy,
  credentialPolicy: CredentialPolicy,
  sandboxPolicy: SandboxPolicy,
  auditPolicy: AuditPolicy,
});
export type ToolDescriptor = z.infer<typeof ToolDescriptor>;
