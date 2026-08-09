import type { ReactNode } from 'react';
import { Footer, Nav } from '../_components/nav';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Nav />
      <main className="container">{children}</main>
      <Footer />
    </>
  );
}
