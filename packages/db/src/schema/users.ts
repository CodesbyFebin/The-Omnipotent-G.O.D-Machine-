import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

/**
 * Users are global (not org-scoped). A user gains access to org data via a
 * membership row (see `orgs.ts`).
 *
 * `id` uses the platform-wide prefixed ULID scheme documented in
 * packages/schemas/src/ids.ts. IDs are generated in application code, not by
 * the database, so they are self-describing in logs and audit events.
 */
export const users = pgTable(
  'users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    /** argon2id hash. Never plaintext. Never JWT. */
    passwordHash: text('password_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    emailIdx: uniqueIndex('users_email_lower_idx').on(t.email),
  }),
);

/**
 * Sessions are DB-backed and revocable. `token_hash` is SHA-256 of the raw
 * cookie value, so a database compromise alone cannot impersonate a user.
 */
export const sessions = pgTable(
  'sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp('last_seen_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    /** UA and IP are stored for auditing sessions only; never returned to clients. */
    userAgent: text('user_agent'),
    ipAddress: text('ip_address'),
  },
  (t) => ({
    tokenHashIdx: uniqueIndex('sessions_token_hash_idx').on(t.tokenHash),
    userIdx: index('sessions_user_id_idx').on(t.userId),
  }),
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type SessionRow = typeof sessions.$inferSelect;
export type NewSessionRow = typeof sessions.$inferInsert;
