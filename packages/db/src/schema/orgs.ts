import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { roleEnum } from './enums.js';
import { users } from './users.js';

export const orgs = pgTable(
  'orgs',
  {
    id: text('id').primaryKey(),
    slug: text('slug').notNull(),
    name: text('name').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex('orgs_slug_idx').on(t.slug),
  }),
);

export const memberships = pgTable(
  'memberships',
  {
    id: text('id').primaryKey(),
    orgId: text('org_id')
      .notNull()
      .references(() => orgs.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: roleEnum('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => ({
    orgUserIdx: uniqueIndex('memberships_org_user_idx').on(t.orgId, t.userId),
    userIdx: index('memberships_user_id_idx').on(t.userId),
  }),
);

export type OrgRow = typeof orgs.$inferSelect;
export type NewOrgRow = typeof orgs.$inferInsert;
export type MembershipRow = typeof memberships.$inferSelect;
export type NewMembershipRow = typeof memberships.$inferInsert;
