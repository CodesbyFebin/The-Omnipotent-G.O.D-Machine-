import { hash, verify } from '@node-rs/argon2';
import { z } from 'zod';

/**
 * argon2id parameters. OWASP 2023 minimum. Increase if hash time on target
 * hardware drops below ~200ms; do NOT decrease without an ADR.
 *
 * `algorithm: 2` === Algorithm.Argon2id. The library ships `Algorithm` as
 * an ambient `const enum`, which cannot be referenced under our TypeScript
 * `isolatedModules: true` setting — so we use the numeric literal.
 */
const ARGON2_OPTIONS = {
  algorithm: 2,
  memoryCost: 19_456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

/** Minimum length is 12; no composition rules (research does not support them). */
export const passwordSchema = z
  .string()
  .min(12, 'password must be at least 12 characters')
  .max(1024, 'password exceeds maximum length');

export async function hashPassword(plaintext: string): Promise<string> {
  passwordSchema.parse(plaintext);
  return hash(plaintext, ARGON2_OPTIONS);
}

export async function verifyPassword(
  plaintext: string,
  hashValue: string,
): Promise<boolean> {
  // Always run verify even for empty strings so timing is comparable.
  if (!hashValue) return false;
  try {
    return await verify(hashValue, plaintext);
  } catch {
    return false;
  }
}
