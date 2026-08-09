import { sql } from 'drizzle-orm';
import { getDb, type Database } from './client';

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
    // `SET LOCAL name = $1` is not valid Postgres — SET requires a literal.
    // `set_config(name, value, is_local=true)` is the equivalent that
    // accepts parameters, keeping us safe against injection.
    await tx.execute(
      sql`SELECT set_config('app.current_user', ${ctx.userId}, true), set_config('app.current_org', ${ctx.orgId}, true)`,
    );
    return fn(tx);
  });
}

/**
 * Sets only `app.current_user`, leaving `app.current_org` unset. Use this
 * for queries that span all orgs a user belongs to (e.g. the dashboard
 * listing every membership). Org-scoped policies fall back to
 * `is_member_of()` which uses only the current user, so the results are
 * correctly filtered to what the user can see across their orgs.
 */
export async function withUserTx<T>(
  userId: string,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  const db = getDb();
  return db.transaction(async (tx) => {
    await tx.execute(
      sql`SELECT set_config('app.current_user', ${userId}, true)`,
    );
    return fn(tx);
  });
}

/**
 * For endpoints that run without an authenticated user (login lookup). No
 * app.current_* variables are set; queries will be constrained by RLS.
 */
export async function withAnonymousTx<T>(
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return getDb().transaction(fn);
}

/**
 * Bootstrap transactions bypass RLS for the specific flows that MUST touch
 * tables before an auth context exists:
 *
 *   - Registration: existence check + user/org/membership creation.
 *   - Login lookup: reading the user row + password_hash to verify against.
 *
 * `SET LOCAL row_security = off` only takes effect for the table owner
 * (which is the role the app connects as in every documented deployment).
 * For any other role Postgres will silently ignore the setting and RLS
 * remains in force — which is the safe failure mode.
 *
 * The set of callers of this helper is small by design and should stay
 * that way. Grep for `withBootstrapTx` before adding a new one.
 */
export async function withBootstrapTx<T>(
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return getDb().transaction(async (tx) => {
    // `row_security` accepts a literal (not a parameter). No user input
    // reaches this string, so a plain SET LOCAL is safe.
    await tx.execute(sql`SET LOCAL row_security = off`);
    return fn(tx);
  });
}
