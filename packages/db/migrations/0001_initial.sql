-- GOD Machine — initial schema
-- Phase 1: identity, orgs, projects, missions, tasks, audit events.
-- RLS policies land in a follow-up migration once schema is reviewed (ADR-0006).

CREATE EXTENSION IF NOT EXISTS "vector";

-- ---------- enums ----------
CREATE TYPE org_role AS ENUM ('OWNER','ADMIN','DEVELOPER','OPERATOR','REVIEWER','VIEWER');
CREATE TYPE autonomy_level AS ENUM ('ASK','ASSIST','EXECUTE','AUTONOMOUS','P99');
CREATE TYPE privacy_class AS ENUM ('PUBLIC','INTERNAL','CONFIDENTIAL','SECRET');
CREATE TYPE risk_level AS ENUM ('LOW','MEDIUM','HIGH','CRITICAL');
CREATE TYPE mission_status AS ENUM ('draft','planned','running','paused','verifying','verified','failed','cancelled');
CREATE TYPE task_status AS ENUM ('pending','blocked','ready','running','waiting_approval','retrying','failed','completed','cancelled');

-- ---------- users + sessions ----------
CREATE TABLE users (
  id            text PRIMARY KEY,
  email         text NOT NULL,
  password_hash text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_lower_idx ON users (lower(email));

CREATE TABLE sessions (
  id            text PRIMARY KEY,
  user_id       text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    text NOT NULL,
  created_at    timestamptz NOT NULL DEFAULT now(),
  last_seen_at  timestamptz NOT NULL DEFAULT now(),
  expires_at    timestamptz NOT NULL,
  revoked_at    timestamptz,
  user_agent    text,
  ip_address    text
);
CREATE UNIQUE INDEX sessions_token_hash_idx ON sessions (token_hash);
CREATE INDEX sessions_user_id_idx ON sessions (user_id);

-- ---------- orgs + memberships ----------
CREATE TABLE orgs (
  id         text PRIMARY KEY,
  slug       text NOT NULL,
  name       text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX orgs_slug_idx ON orgs (slug);

CREATE TABLE memberships (
  id         text PRIMARY KEY,
  org_id     text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  user_id    text NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role       org_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX memberships_org_user_idx ON memberships (org_id, user_id);
CREATE INDEX memberships_user_id_idx ON memberships (user_id);

-- ---------- projects + repositories ----------
CREATE TABLE projects (
  id          text PRIMARY KEY,
  org_id      text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  slug        text NOT NULL,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  created_at  timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX projects_org_slug_idx ON projects (org_id, slug);
CREATE INDEX projects_org_id_idx ON projects (org_id);

CREATE TABLE repositories (
  id             text PRIMARY KEY,
  project_id     text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name           text NOT NULL,
  url            text NOT NULL,
  default_branch text NOT NULL DEFAULT 'main',
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX repositories_project_id_idx ON repositories (project_id);

-- ---------- missions + tasks ----------
CREATE TABLE missions (
  id             text PRIMARY KEY,
  org_id         text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  project_id     text NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  created_by     text NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  status         mission_status NOT NULL DEFAULT 'draft',
  autonomy_level autonomy_level NOT NULL,
  privacy_class  privacy_class NOT NULL,
  intent         text NOT NULL,
  specification  jsonb,
  budget         jsonb,
  risk_level     risk_level NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now(),
  started_at     timestamptz,
  completed_at   timestamptz
);
CREATE INDEX missions_org_id_idx ON missions (org_id);
CREATE INDEX missions_project_id_idx ON missions (project_id);
CREATE INDEX missions_status_idx ON missions (status);

CREATE TABLE tasks (
  id                 text PRIMARY KEY,
  mission_id         text NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  parent_task_id     text,
  title              text NOT NULL,
  description        text NOT NULL DEFAULT '',
  status             task_status NOT NULL DEFAULT 'pending',
  assigned_agent_id  text,
  retry_count        integer NOT NULL DEFAULT 0,
  outputs            jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  started_at         timestamptz,
  completed_at       timestamptz
);
CREATE INDEX tasks_mission_id_idx ON tasks (mission_id);
CREATE INDEX tasks_status_idx ON tasks (status);

CREATE TABLE task_dependencies (
  task_id            text NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id text NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, depends_on_task_id)
);
CREATE INDEX task_dependencies_depends_on_idx ON task_dependencies (depends_on_task_id);

-- ---------- audit events ----------
CREATE TABLE audit_events (
  id                text PRIMARY KEY,
  org_id            text NOT NULL REFERENCES orgs(id) ON DELETE CASCADE,
  type              text NOT NULL,
  schema_version    integer NOT NULL DEFAULT 1,
  mission_id        text,
  task_id           text,
  previous_event_id text,
  event             jsonb NOT NULL,
  occurred_at       timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_events_org_id_idx ON audit_events (org_id);
CREATE INDEX audit_events_mission_id_idx ON audit_events (mission_id);
CREATE INDEX audit_events_task_id_idx ON audit_events (task_id);
CREATE INDEX audit_events_type_idx ON audit_events (type);
CREATE INDEX audit_events_occurred_at_idx ON audit_events (occurred_at);
