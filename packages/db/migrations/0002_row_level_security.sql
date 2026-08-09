-- GOD Machine — Phase 1: Row-Level Security
-- Follow-up to 0001_initial. Requires the application to set the two Postgres
-- session variables the policies read:
--
--   SET LOCAL app.current_user = '<userId>';
--   SET LOCAL app.current_org  = '<orgId>';
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

CREATE OR REPLACE FUNCTION current_app_org() RETURNS text
LANGUAGE sql STABLE AS $$
  SELECT NULLIF(current_setting('app.current_org', true), '')
$$;

CREATE OR REPLACE FUNCTION is_member_of(target_org text) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE org_id = target_org
      AND user_id = current_app_user()
  )
$$;

CREATE OR REPLACE FUNCTION has_org_role(target_org text, VARIADIC roles text[]) RETURNS boolean
LANGUAGE sql STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE org_id = target_org
      AND user_id = current_app_user()
      AND role::text = ANY (roles)
  )
$$;

-- ---------- users ----------
-- A user can see their own row. No user should see another user's row via
-- ORM queries — cross-user visibility (e.g. "who else is in this org") goes
-- through joins against memberships, which are org-scoped.
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;

CREATE POLICY users_self_select ON users
  FOR SELECT USING (id = current_app_user());

CREATE POLICY users_self_update ON users
  FOR UPDATE USING (id = current_app_user())
  WITH CHECK (id = current_app_user());

-- No RLS on INSERT: registration runs in an anonymous transaction that has
-- not yet set app.current_user. Application-level validation (email
-- uniqueness) covers the insert path. Once we have a signed-up user, RLS
-- kicks in for reads/updates.

-- ---------- sessions ----------
-- Users can only see their own sessions. Login/logout paths run within a
-- context that has app.current_user set once the session is resolved.
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions FORCE ROW LEVEL SECURITY;

CREATE POLICY sessions_self_all ON sessions
  FOR ALL USING (user_id = current_app_user())
  WITH CHECK (user_id = current_app_user());

-- ---------- orgs ----------
ALTER TABLE orgs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orgs FORCE ROW LEVEL SECURITY;

CREATE POLICY orgs_member_select ON orgs
  FOR SELECT USING (is_member_of(id));

CREATE POLICY orgs_owner_update ON orgs
  FOR UPDATE USING (has_org_role(id, 'OWNER', 'ADMIN'))
  WITH CHECK (has_org_role(id, 'OWNER', 'ADMIN'));

CREATE POLICY orgs_owner_delete ON orgs
  FOR DELETE USING (has_org_role(id, 'OWNER'));

-- No RLS on INSERT: org creation happens during registration in an
-- anonymous transaction.

-- ---------- memberships ----------
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships FORCE ROW LEVEL SECURITY;

CREATE POLICY memberships_member_select ON memberships
  FOR SELECT USING (is_member_of(org_id));

CREATE POLICY memberships_admin_insert ON memberships
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN'));

CREATE POLICY memberships_admin_update ON memberships
  FOR UPDATE USING (has_org_role(org_id, 'OWNER', 'ADMIN'))
  WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN'));

CREATE POLICY memberships_admin_delete ON memberships
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));

-- ---------- projects ----------
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects FORCE ROW LEVEL SECURITY;

CREATE POLICY projects_member_select ON projects
  FOR SELECT USING (is_member_of(org_id));

CREATE POLICY projects_dev_insert ON projects
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER'));

CREATE POLICY projects_dev_update ON projects
  FOR UPDATE USING (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER'))
  WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER'));

CREATE POLICY projects_admin_delete ON projects
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));

-- ---------- repositories ----------
-- Repositories inherit their org from their project. We enforce that via a
-- subquery rather than duplicating org_id on the repositories table.
ALTER TABLE repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE repositories FORCE ROW LEVEL SECURITY;

CREATE POLICY repositories_member_select ON repositories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = repositories.project_id
        AND is_member_of(p.org_id)
    )
  );

CREATE POLICY repositories_dev_insert ON repositories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id
        AND has_org_role(p.org_id, 'OWNER', 'ADMIN', 'DEVELOPER')
    )
  );

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

CREATE POLICY repositories_admin_delete ON repositories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = repositories.project_id
        AND has_org_role(p.org_id, 'OWNER', 'ADMIN')
    )
  );

-- ---------- missions ----------
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions FORCE ROW LEVEL SECURITY;

CREATE POLICY missions_member_select ON missions
  FOR SELECT USING (is_member_of(org_id));

CREATE POLICY missions_dev_insert ON missions
  FOR INSERT WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));

CREATE POLICY missions_dev_update ON missions
  FOR UPDATE USING (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'))
  WITH CHECK (has_org_role(org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR'));

CREATE POLICY missions_admin_delete ON missions
  FOR DELETE USING (has_org_role(org_id, 'OWNER', 'ADMIN'));

-- ---------- tasks ----------
-- Tasks inherit their org from their mission.
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;

CREATE POLICY tasks_member_select ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM missions m
      WHERE m.id = tasks.mission_id
        AND is_member_of(m.org_id)
    )
  );

CREATE POLICY tasks_dev_insert ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM missions m
      WHERE m.id = mission_id
        AND has_org_role(m.org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR')
    )
  );

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

CREATE POLICY tasks_admin_delete ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM missions m
      WHERE m.id = tasks.mission_id
        AND has_org_role(m.org_id, 'OWNER', 'ADMIN')
    )
  );

-- ---------- task_dependencies ----------
-- Dependencies inherit visibility from the task they reference.
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies FORCE ROW LEVEL SECURITY;

CREATE POLICY task_dependencies_member_select ON task_dependencies
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN missions m ON m.id = t.mission_id
      WHERE t.id = task_dependencies.task_id
        AND is_member_of(m.org_id)
    )
  );

CREATE POLICY task_dependencies_dev_insert ON task_dependencies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN missions m ON m.id = t.mission_id
      WHERE t.id = task_id
        AND has_org_role(m.org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR')
    )
  );

CREATE POLICY task_dependencies_dev_delete ON task_dependencies
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN missions m ON m.id = t.mission_id
      WHERE t.id = task_dependencies.task_id
        AND has_org_role(m.org_id, 'OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR')
    )
  );

-- ---------- audit_events ----------
-- Members can read audit events for their org. Writes are always performed
-- by the same transaction that made the state change, so the WITH CHECK is
-- a defence against a stray write from an unrelated org context.
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_events_member_select ON audit_events
  FOR SELECT USING (is_member_of(org_id));

CREATE POLICY audit_events_member_insert ON audit_events
  FOR INSERT WITH CHECK (
    -- Registration writes an event before the session context is set. We
    -- accept an insert when the app.current_org matches or when there is
    -- no current org (bootstrap). Once app.current_org is set, it must
    -- match.
    current_app_org() IS NULL OR org_id = current_app_org()
  );

-- Never UPDATE or DELETE audit events. The log is append-only by design.
-- Explicit revoke: even the app role should not be able to mutate the log.
CREATE POLICY audit_events_no_update ON audit_events
  FOR UPDATE USING (false);

CREATE POLICY audit_events_no_delete ON audit_events
  FOR DELETE USING (false);
