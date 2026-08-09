import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getAuthContext } from '@/lib/session';
import { Footer } from '../_components/nav';
import { LogoutButton } from './_components/logout-button';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const auth = await getAuthContext();
  if (!auth) redirect('/login');

  return (
    <>
      <header className="nav">
        <div className="nav-inner">
          <Link href="/app" className="brand">
            GOD<span className="brand-sub">/ dashboard</span>
          </Link>
          <nav className="nav-links" aria-label="Primary">
            <Link href="/app">Overview</Link>
            <LogoutButton />
          </nav>
        </div>
      </header>
      <main className="container">{children}</main>
      <Footer />
    </>
  );
}
