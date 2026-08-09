// This module is server-only via its use of getAuthContext + @god/db.
// Do not import from a client component.

import { NextResponse } from 'next/server';
import { and, eq, schema, withUserTx } from '@god/db';
import { getAuthContext, type AuthenticatedUser } from './session';

/**
 * Authorization guards.
 *
 * Authentication answers "who are you". These guards answer "may you touch
 * this resource". Layout-level protection (`/app/layout.tsx` redirect) is
 * necessary but not sufficient — every mutation and every resource read
 * that isn't user-self-scoped must call the appropriate guard.
 *
 * Two call styles are supported:
 *
 *   1. Server components / server actions — `await requireUser()` throws
 *      by redirecting to `/login`. The guard's return value is the
 *      auth context / membership row.
 *
 *   2. API route handlers — `await requireUserOrRespond(request)` returns
 *      either the auth context or a NextResponse. Route handlers destructure
 *      and short-circuit:
 *
 *        const result = await requireUserOrRespond();
 *        if (result instanceof NextResponse) return result;
 *
 * Guards always run through `withUserTx` so RLS enforces cross-org denial
 * *even if the guard has a bug*. Defence in depth.
 */

// -------------------- errors --------------------

export class UnauthenticatedError extends Error {
  constructor() {
    super('unauthenticated');
    this.name = 'UnauthenticatedError';
  }
}

export class ForbiddenError extends Error {
  constructor(reason = 'forbidden') {
    super(reason);
    this.name = 'ForbiddenError';
  }
}

// -------------------- server-component style --------------------

/** Throws UnauthenticatedError if no session. Returns the auth context. */
export async function requireUser(): Promise<AuthenticatedUser> {
  const auth = await getAuthContext();
  if (!auth) throw new UnauthenticatedError();
  return auth;
}

export interface OrgMembership {
  orgId: string;
  userId: string;
  role: 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'OPERATOR' | 'REVIEWER' | 'VIEWER';
}

/**
 * Throws ForbiddenError if the current user isn't a member of the given org.
 * Returns the membership record.
 */
export async function requireOrgMembership(orgId: string): Promise<OrgMembership> {
  const auth = await requireUser();
  const rows = await withUserTx(auth.userId, (tx) =>
    tx
      .select({
        orgId: schema.memberships.orgId,
        userId: schema.memberships.userId,
        role: schema.memberships.role,
      })
      .from(schema.memberships)
      .where(
        and(
          eq(schema.memberships.userId, auth.userId),
          eq(schema.memberships.orgId, orgId),
        ),
      )
      .limit(1),
  );
  const row = rows[0];
  if (!row) throw new ForbiddenError('not_a_member');
  return row;
}

const ROLE_HIERARCHY = ['OWNER', 'ADMIN', 'DEVELOPER', 'OPERATOR', 'REVIEWER', 'VIEWER'] as const;
type Role = (typeof ROLE_HIERARCHY)[number];

/**
 * Throws ForbiddenError if the current user's role in the org isn't at
 * least `minimum`. Role ordering matches the OWNER > ADMIN > DEVELOPER >
 * OPERATOR > REVIEWER > VIEWER hierarchy.
 */
export async function requireOrgRole(
  orgId: string,
  minimum: Role,
): Promise<OrgMembership> {
  const membership = await requireOrgMembership(orgId);
  const userRank = ROLE_HIERARCHY.indexOf(membership.role);
  const requiredRank = ROLE_HIERARCHY.indexOf(minimum);
  if (userRank === -1 || userRank > requiredRank) {
    throw new ForbiddenError(`requires_role_${minimum.toLowerCase()}_or_higher`);
  }
  return membership;
}

/**
 * Throws ForbiddenError if the current user cannot access the project.
 * Access is granted iff the project exists AND the caller is a member of
 * the project's org.
 */
export async function requireProjectAccess(projectId: string): Promise<{
  projectId: string;
  orgId: string;
  membership: OrgMembership;
}> {
  const auth = await requireUser();
  const rows = await withUserTx(auth.userId, (tx) =>
    tx
      .select({ id: schema.projects.id, orgId: schema.projects.orgId })
      .from(schema.projects)
      .where(eq(schema.projects.id, projectId))
      .limit(1),
  );
  const project = rows[0];
  // RLS already filters projects to those in an org the user belongs to,
  // so a missing row is either "does not exist" or "not a member" — we
  // return the same 404-shaped error either way (existence must not leak).
  if (!project) throw new ForbiddenError('project_not_accessible');
  const membership = await requireOrgMembership(project.orgId);
  return { projectId: project.id, orgId: project.orgId, membership };
}

/** Same shape for missions. */
export async function requireMissionAccess(missionId: string): Promise<{
  missionId: string;
  projectId: string;
  orgId: string;
  membership: OrgMembership;
}> {
  const auth = await requireUser();
  const rows = await withUserTx(auth.userId, (tx) =>
    tx
      .select({
        id: schema.missions.id,
        projectId: schema.missions.projectId,
        orgId: schema.missions.orgId,
      })
      .from(schema.missions)
      .where(eq(schema.missions.id, missionId))
      .limit(1),
  );
  const mission = rows[0];
  if (!mission) throw new ForbiddenError('mission_not_accessible');
  const membership = await requireOrgMembership(mission.orgId);
  return {
    missionId: mission.id,
    projectId: mission.projectId,
    orgId: mission.orgId,
    membership,
  };
}

// -------------------- route-handler style --------------------

/**
 * Route-handler wrapper. Returns either the AuthenticatedUser or a
 * NextResponse the handler should return immediately.
 */
export async function requireUserOrRespond(): Promise<
  AuthenticatedUser | NextResponse
> {
  try {
    return await requireUser();
  } catch (err) {
    return errorToResponse(err);
  }
}

export async function requireOrgMembershipOrRespond(
  orgId: string,
): Promise<OrgMembership | NextResponse> {
  try {
    return await requireOrgMembership(orgId);
  } catch (err) {
    return errorToResponse(err);
  }
}

export async function requireOrgRoleOrRespond(
  orgId: string,
  minimum: Role,
): Promise<OrgMembership | NextResponse> {
  try {
    return await requireOrgRole(orgId, minimum);
  } catch (err) {
    return errorToResponse(err);
  }
}

function errorToResponse(err: unknown): NextResponse {
  if (err instanceof UnauthenticatedError) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });
  }
  if (err instanceof ForbiddenError) {
    // 404 not 403: existence must not leak. See ADR-0006 (auth) and the
    // threat model §T4 (cross-tenant data leakage).
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  throw err;
}
