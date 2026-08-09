import { execSync } from 'node:child_process';
import path from 'node:path';
import postgres from 'postgres';
import { beforeAll } from 'vitest';

/**
 * Runs once per test process. Requires DATABASE_URL to point at an empty
 * (or truncateable) Postgres with pgvector available. CI provides one via
 * the Postgres service; locally, install Postgres 17 (which ships with
 * pgvector on Homebrew) or run the dev compose stack.
 *
 * Uses `postgres.js` inline for the schema reset and delegates the migration
 * run to `packages/db`'s migrate script — same code CI and dev use.
 */
beforeAll(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must be set for integration tests');
  }

  // Drop and recreate the public schema (and drizzle's migration ledger) so
  // each test process starts from a completely clean DB. This also
  // exercises the migration-on-empty path that P1-009 requires.
  const sql = postgres(url, { max: 1, prepare: false });
  await sql.unsafe(
    'DROP SCHEMA IF EXISTS drizzle CASCADE; DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO CURRENT_USER;',
  );
  await sql.end();

  const dbPkgDir = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '../../../packages/db',
  );
  execSync('pnpm --silent migrate', {
    cwd: dbPkgDir,
    env: { ...process.env },
    stdio: 'inherit',
  });

  // Verify the migration actually created the tables — cheap smoke check
  // that catches drizzle's "reports success but produced nothing" failure
  // mode (missing statement-breakpoints, extended-protocol truncation).
  const verify = postgres(url, { max: 1, prepare: false });
  const rows = await verify<{ table_name: string }[]>`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'audit_events'
  `;
  await verify.end();
  if (rows.length === 0) {
    throw new Error(
      'setup/global.ts: migration reported success but no `audit_events` table exists. ' +
        'Check packages/db/migrations for missing `--> statement-breakpoint` markers.',
    );
  }
});
