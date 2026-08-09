-- GOD Machine — Phase 1: Row-Level Security + app role
-- Follow-up to 0001_initial. Requires the application to set the two Postgres
-- session variables the policies read:
-- ---------- non-superuser app role ----------
-- FORCE ROW LEVEL SECURITY is bypassed by superusers. In containerized
-- Postgres deployments the connection role is typically a superuser
-- (POSTGRES_USER on the docker image; local Homebrew installs where the
-- user made themselves superuser). To make RLS actually enforce, the tx
-- helpers `SET LOCAL ROLE god_app` per authenticated/user transaction —
-- this role must exist and must have CRUD on every table.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'god_app') THEN
    CREATE ROLE god_app NOSUPERUSER NOINHERIT LOGIN PASSWORD 'god_app';
  END IF;
END $$;
--> statement-breakpoint
GRANT USAGE ON SCHEMA public TO god_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO god_app;
--> statement-breakpoint
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO god_app;
--> statement-breakpoint
-- Ensure any tables added by later migrations are also visible to god_app
-- without needing a manual GRANT each time.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO god_app;
--> statement-breakpoint
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO god_app;
--> statement-breakpoint


--
--   SET LOCAL app.current_user = '<userId>';
--> statement-breakpoint
--   SET LOCAL app.current_org  = '<orgId>';
--> statement-breakpoint
--
-- `packages/db/src/tx.ts::withAuthenticatedTx` already does this. Callers who
-- open a raw transaction without setting these variables will see empty
-- result sets from org-scoped tables — deliberate defence in depth against
-- forgetting to scope a query.
--
-- Design notes:
--   * `current_setting(name, true)` returns NULL rather than throwing when
--     the variable is unset. Every policy tests for a non-null value.
--   * Membership visibility is computed via `is_member_of(org_id)` — one
--     definition, referenced by every org-scoped table.
--   * Role checks (OWNER/ADMIN vs the rest) are inlined per-table where
--     mutation vs read differs. This ADR intentionally keeps policies
--     inspectable rather than clever.
--   * We do not force RLS on the app role; superusers (owner of the
--     migration) bypass policies, which is expected for admin scripts.

-- ---------- helper functions ----------

CREATE OR REPLACE FUNCTION current_app_user() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.current_user', true), '')
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION current_app_org() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.current_org', true), '')
$$;
--> statement-breakpoint

-- SECURITY DEFINER so the inner SELECT on memberships bypasses the RLS
-- policy on memberships. Without this, calling is_member_of() from a
-- policy (which we do everywhere) recurses infinitely: RLS on memberships
-- → is_member_of → SELECT memberships → RLS on memberships → …
-- The function is trivially bounded — it only reads (memberships) with
-- the specific (target_org, current_app_user) predicate — so escalating
-- to definer privileges is safe.
CREATE OR REPLACE FUNCTION is_member_of(target_org text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE org_id = target_org
      AND user_id = current_app_user()
  )
$$;
--> statement-breakpoint

CREATE OR REPLACE FUNCTION has_org_role(target_org text, VARIADIC roles text[]) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE org_id = target_org
      AND user_id = current_app_user()
      AND role::text = ANY (roles)
  )
$$;
--> statement-breakpoint

-- ---------- users ----------
-- A user can see their own row. No user should see another user's row via
-- ORM queries — cross-user visibility (e.g. "who else is in this org") goes
-- through joins against memberships, which are org-scoped.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE users FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY users_self_select ON users
  FOR SELECT USING (id = current_app_user());
--> statement-breakpoint

CREATE POLICY users_self_update ON users
  FOR UPDATE USING (id = current_app_user())
  WITH CHECK (id = current_app_user());
--> statement-breakpoint

-- No RLS on INSERT: registration runs in an anonymous transaction that has
-- not yet set app.current_user. Application-level validation (email
-- uniqueness) covers the insert path. Once we have a signed-up user, RLS
-- kicks in for reads/updates.

-- ---------- sessions ----------
-- Users can only see their own sessions. Login/logout paths run within a
-- context that has app.current_user set once the session is resolved.
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY sessions_self_all ON sessions
  FOR ALL USING (user_id = current_app_user())
  WITH CHECK (user_id = current_app_user());
--> statement-breakpoint

-- ---------- orgs ----------
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE orgs FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY orgs_member_select ON orgs
  FOR SELECT USING (is_member_of(id));
--> statement-breakpoint

CREATE POLICY orgs_owner_update ON orgs
  FOR UPDATE USING (has_org_role(id, 'OWNER', 'ADMIN'))
  WITH CHECK (has_org_role(id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

CREATE POLICY orgs_owner_delete ON orgs
  FOR DELETE USING (has_org_role(id, 'OWNER'));
--> statement-breakpoint

-- No RLS on INSERT: org creation happens during registration in an
-- anonymous transaction.

-- ---------- memberships ----------
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY memberships_member_select ON memberships
  FOR SELECT USING (is_member_of(org_id));
--> statement-breakpoint

CREATE POLICY memberships_admin_insert ON memberships
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

CREATE POLICY memberships_admin_update ON memberships
  FOR UPDATE USING (has_org_role(org_id, 'OWNER', 'ADMIN'))
  WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

CREATE POLICY memberships_admin_delete ON memberships
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

-- ---------- projects ----------
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE projects FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY projects_member_select ON projects
  FOR SELECT USING (is_member_of(org_id));
--> statement-breakpoint

CREATE POLICY projects_dev_insert ON projects
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER'));
--> statement-breakpoint

CREATE POLICY projects_dev_update ON projects
  FOR UPDATE USING (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER'))
  WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER'));
--> statement-breakpoint

CREATE POLICY projects_admin_delete ON projects
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

-- ---------- repositories ----------
-- Repositories inherit their org from their project. We enforce that via a
-- subquery rather than duplicating org_id on the repositories table.
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE repositories FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY repositories_member_select ON repositories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = repositories.project_id
        AND is_member_of(p.org_id)
    )
  );
--> statement-breakpoint

CREATE POLICY repositories_dev_insert ON repositories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
        AND has_org_role(p.org_id, 'OWNER', 'ADMIN', 'DEVELOPER')
    )
  );
--> statement-breakpoint

CREATE POLICY repositories_dev_update ON repositories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = repositories.project_id
        AND has_org_role(p.org_id, 'OWNER', 'ADMIN', 'DEVELOPER')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
        AND has_org_role(p.org_id, 'OWNER', 'ADMIN', 'DEVELOPER')
    )
  );
--> statement-breakpoint

CREATE POLICY repositories_admin_delete ON repositories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = repositories.project_id
        AND has_org_role(p.org_id, 'OWNER', 'ADMIN')
    )
  );
--> statement-breakpoint

-- ---------- missions ----------
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE missions FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY missions_member_select ON missions
  FOR SELECT USING (is_member_of(org_id));
--> statement-breakpoint

CREATE POLICY missions_dev_insert ON missions
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint

CREATE POLICY missions_dev_update ON missions
  FOR UPDATE USING (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'))
  WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));
--> statement-breakpoint

CREATE POLICY missions_admin_delete ON missions
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));
--> statement-breakpoint

-- ---------- tasks ----------
-- Tasks inherit their org from their mission.
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY tasks_member_select ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions m
      WHERE m.id = tasks.mission_id
        AND is_member_of(m.org_id)
    )
  );
--> statement-breakpoint

CREATE POLICY tasks_dev_insert ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions m
      WHERE m.id = mission_id
        AND has_org_role(m.org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR')
    )
  );
--> statement-breakpoint

CREATE POLICY tasks_dev_update ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM missions m
      WHERE m.id = tasks.mission_id
        AND has_org_role(m.org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions m
      WHERE m.id = mission_id
        AND has_org_role(m.org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR')
    )
  );
--> statement-breakpoint

CREATE POLICY tasks_admin_delete ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM missions m
      WHERE m.id = tasks.mission_id
        AND has_org_role(m.org_id, 'OWNER', 'ADMIN')
    )
  );
--> statement-breakpoint

-- ---------- task_dependencies ----------
-- Dependencies inherit visibility from the task they reference.
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE task_dependencies FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY task_dependencies_member_select ON task_dependencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN missions m ON m.id = t.mission_id
      WHERE t.id = task_dependencies.task_id
        AND is_member_of(m.org_id)
    )
  );
--> statement-breakpoint

CREATE POLICY task_dependencies_dev_insert ON task_dependencies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN missions m ON m.id = t.mission_id
      WHERE t.id = task_id
        AND has_org_role(m.org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR')
    )
  );
--> statement-breakpoint

CREATE POLICY task_dependencies_dev_delete ON task_dependencies
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN missions m ON m.id = t.mission_id
      WHERE t.id = task_dependencies.task_id
        AND has_org_role(m.org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR')
    )
  );
--> statement-breakpoint

-- ---------- audit_events ----------
-- Members can read audit events for their org. Writes are always performed
-- by the same transaction that made the state change, so the WITH CHECK is
-- a defence against a stray write from an unrelated org context.
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY audit_events_member_select ON audit_events
  FOR SELECT USING (is_member_of(org_id));
--> statement-breakpoint

CREATE POLICY audit_events_member_insert ON audit_events
  FOR INSERT WITH CHECK (
    -- Registration writes an event before the session context is set. We
    -- accept an insert when the app.current_org matches or when there is
    -- no current org (bootstrap). Once app.current_org is set, it must
    -- match.
    current_app_org() IS NULL OR org_id = current_app_org()
  );
--> statement-breakpoint

-- Never UPDATE or DELETE audit events. The log is append-only by design.
-- Explicit revoke: even the app role should not be able to mutate the log.
CREATE POLICY audit_events_no_update ON audit_events
  FOR UPDATE USING (false);
--> statement-breakpoint

CREATE POLICY audit_events_no_delete ON audit_events
  FOR DELETE USING (false);
