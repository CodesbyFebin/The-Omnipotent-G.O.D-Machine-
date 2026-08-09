/**
 * In-process token bucket. Phase 1 only — replaced by a Redis-backed limiter
 * when the worker runtime lands (see BUILD-TRACKER P9). Not shared across
 * processes; multi-process deployments should not rely on this for a hard
 * ceiling.
 */

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const BUCKETS = new Map<string, Bucket>();
const CAPACITY = 10;
const REFILL_PER_MIN = 10;

export interface RateLimitDecision {
  allowed: boolean;
  retryAfterSec: number;
}

export function rateLimit(key: string): RateLimitDecision {
  const now = Date.now();
  const bucket = BUCKETS.get(key) ?? { tokens: CAPACITY, updatedAt: now };
  const elapsedMin = (now - bucket.updatedAt) / 60_000;
  const refilled = Math.min(CAPACITY, bucket.tokens + elapsedMin * REFILL_PER_MIN);
  if (refilled >= 1) {
    BUCKETS.set(key, { tokens: refilled - 1, updatedAt: now });
    return { allowed: true, retryAfterSec: 0 };
  }
  const missing = 1 - refilled;
  const retryAfterSec = Math.ceil((missing / REFILL_PER_MIN) * 60);
  BUCKETS.set(key, { tokens: refilled, updatedAt: now });
  return { allowed: false, retryAfterSec };
}

export function clientKey(request: Request, extra: string): string {
  const xff = request.headers.get('x-forwarded-for');
  const ip = (xff?.split(',')[0] ?? '').trim() || 'unknown';
  return `${ip}:${extra}`;
}
