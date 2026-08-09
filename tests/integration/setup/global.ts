import { execSync } from 'node:child_process';
import path from 'node:path';
import postgres from 'postgres';
import { beforeAll } from 'vitest';

/**
 * Runs once per test process. Requires DATABASE_URL to point at an empty
 * (or truncateable) Postgres 16 with pgvector available. CI provides one
 * via the Postgres service; locally, `docker compose -f
 * infrastructure/compose/dev.yml up -d` gives you the same.
 */
beforeAll(async () => {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL must be set for integration tests');
  }

  // Drop and recreate the public schema so each test process starts from
  // a completely clean DB. This also exercises the migration-on-empty path
  // that P1-009 requires.
  const sql = postgres(url, { max: 1, prepare: false });
  await sql.unsafe(
    'DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO CURRENT_USER;',
  );
  await sql.end();

  // Run migrations from packages/db.
  const dbPkgDir = path.resolve(
    path.dirname(new URL(import.meta.url).pathname),
    '../../../packages/db',
  );
  execSync('pnpm --silent migrate', {
    cwd: dbPkgDir,
    env: { ...process.env },
    stdio: 'inherit',
  });
});
