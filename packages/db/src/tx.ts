import { sql } from 'drizzle-orm';
import { getDb, type Database } from './client.js';

export type Transaction = Parameters<
  Parameters<Database['transaction']>[0]
>[0];

export interface AuthContext {
  userId: string;
  orgId: string;
}

/**
 * Opens a transaction and sets Postgres session variables that org-scoped
 * row-level-security policies read (`app.current_user`, `app.current_org`).
 *
 * The RLS policies themselves land in a follow-up migration (see ADR-0006).
 * Even before RLS is enabled, the `SET LOCAL` calls are safe no-ops — this
 * lets application code adopt the pattern immediately without waiting.
 */
export async function withAuthenticatedTx<T>(
  ctx: AuthContext,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  const db = getDb();
  return db.transaction(async (tx) => {
    await tx.execute(sql`SET LOCAL app.current_user = ${ctx.userId}`);
    await tx.execute(sql`SET LOCAL app.current_org = ${ctx.orgId}`);
    return fn(tx);
  });
}

/**
 * For endpoints that must run without an authenticated user (registration,
 * login) but still want transactional guarantees for the event log.
 */
export async function withAnonymousTx<T>(
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return getDb().transaction(fn);
}
