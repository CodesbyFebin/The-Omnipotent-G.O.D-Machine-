import { getDb, schema, sql, withBootstrapTx } from '@god/db';

/**
 * Truncate every row while keeping the schema intact. Called between test
 * files so shared state doesn't leak.
 */
export async function truncateAll(): Promise<void> {
  await withBootstrapTx(async (tx) => {
    await tx.execute(sql`
      TRUNCATE TABLE
        audit_events,
        task_dependencies,
        tasks,
        missions,
        repositories,
        projects,
        memberships,
        sessions,
        orgs,
        users
      RESTART IDENTITY CASCADE
    `);
  });
}

/** Convenience: raw psql connection through Drizzle for setup queries. */
export function rawDb() {
  return getDb();
}

export { schema };
