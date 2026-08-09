import { eq, schema, withUserTx } from '@god/db';
import { requireUser } from '@/lib/authz';

export const dynamic = 'force-dynamic';

export default async function AppDashboardPage() {
  const auth = await requireUser();

  const { user, memberships } = await withUserTx(auth.userId, async (tx) => {
    const [u] = await tx
      .select({ id: schema.users.id, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, auth.userId))
      .limit(1);

    const ms = await tx
      .select({
        orgId: schema.orgs.id,
        orgName: schema.orgs.name,
        orgSlug: schema.orgs.slug,
        role: schema.memberships.role,
      })
      .from(schema.memberships)
      .innerJoin(schema.orgs, eq(schema.memberships.orgId, schema.orgs.id))
      .where(eq(schema.memberships.userId, auth.userId));

    return { user: u, memberships: ms };
  });

  return (
    <section className="hero" style={{ paddingBottom: '2rem' }}>
      <h1>Welcome{user?.email ? `, ${user.email}` : ''}</h1>
      <p className="lede">
        You're signed in. This dashboard is intentionally minimal — most Phase 1
        surfaces (projects, missions, agents) land as the tracker items become{' '}
        <code>VERIFIED</code>.
      </p>

      <section className="section">
        <h2>Your organizations</h2>
        {memberships.length === 0 ? (
          <div className="status-banner">
            No organizations yet. This shouldn't happen — registering should have
            created one. If you're seeing this, please report it.
          </div>
        ) : (
          <div className="grid">
            {memberships.map((m) => (
              <article key={m.orgId} className="card">
                <h3>{m.orgName}</h3>
                <p>
                  Role: <code>{m.role}</code>
                </p>
                <p style={{ marginTop: '0.5rem' }}>
                  Slug: <code>{m.orgSlug}</code>
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <h2>Coming soon (from the tracker)</h2>
        <div className="grid">
          <Placeholder title="Projects" body="Create and manage projects within your org." tracker="P1-003" />
          <Placeholder title="Missions" body="Author, run, and observe missions." tracker="P1-004" />
          <Placeholder title="Approvals" body="Review policy-gated tool actions." tracker="P4-006" />
          <Placeholder title="Audit" body="Query the append-only event log." tracker="P1-005" />
        </div>
      </section>
    </section>
  );
}

function Placeholder({ title, body, tracker }: { title: string; body: string; tracker: string }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{body}</p>
      <span className="tag tag-todo">Tracker: {tracker}</span>
    </article>
  );
}
