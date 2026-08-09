import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema/index.js';

export type Database = PostgresJsDatabase<typeof schema>;

let cachedDb: Database | null = null;
let cachedSql: ReturnType<typeof postgres> | null = null;

/**
 * Returns a process-wide Drizzle handle. Safe to call from anywhere; connection
 * pooling is delegated to `postgres.js`. In tests, call `closeDb()` between
 * runs to release connections.
 */
export function getDb(): Database {
  if (cachedDb) return cachedDb;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. In dev, `cp .env.example .env` and start the compose stack.',
    );
  }
  cachedSql = postgres(url, {
    max: Number(process.env.DATABASE_POOL_MAX ?? '10'),
    idle_timeout: 30,
    prepare: true,
    // Never surface secrets in error text.
    onnotice: () => undefined,
  });
  cachedDb = drizzle(cachedSql, { schema });
  return cachedDb;
}

export async function closeDb(): Promise<void> {
  if (cachedSql) {
    await cachedSql.end({ timeout: 5 });
    cachedSql = null;
    cachedDb = null;
  }
}
