import { NextResponse } from 'next/server';

/**
 * Liveness probe. Reports only what this process can honestly answer without
 * touching downstream services. A real readiness probe (Postgres, Redis,
 * providers) lands with Phase 1.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    phase: 0,
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
}
