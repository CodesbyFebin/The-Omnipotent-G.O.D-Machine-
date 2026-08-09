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
 * The non-superuser role every authenticated / user-scoped transaction
 * demotes into via `SET LOCAL ROLE`. Row-level security is bypassed by
 * superusers even with FORCE ROW LEVEL SECURITY, so if the application
 * connects as a superuser (typical for containerized Postgres where
 * POSTGRES_USER becomes the DB superuser) RLS decorates rather than
 * enforces. Demoting per-transaction fixes that without needing a
 * separate DB URL for the app.
 *
 * The role is created and granted CRUD by the migration in
 * packages/db/migrations/0002_row_level_security.sql (idempotent DO block).
 * Bootstrap transactions deliberately do NOT demote — they need superuser
 * so `row_security = off` takes effect.
 */
const APP_ROLE = process.env.DATABASE_APP_ROLE ?? 'god_app';

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
    // set_config( , , true) is the parameterizable form of SET LOCAL.
    await tx.execute(
      sql`SELECT set_config('app.current_user', ${ctx.userId}, true), set_config('app.current_org', ${ctx.orgId}, true)`,
    );
    // Demote to a non-superuser role so FORCE ROW LEVEL SECURITY actually
    // enforces. The role literal is not parameterizable; APP_ROLE is a
    // process-config constant, never user input.
    await tx.execute(sql.raw(`SET LOCAL ROLE ${APP_ROLE}`));
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
    await tx.execute(sql.raw(`SET LOCAL ROLE ${APP_ROLE}`));
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
