import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'GOD Machine — Open Agentic Development OS',
    template: '%s — GOD Machine',
  },
  description:
    'GOD Machine is the sovereign runtime connecting intelligence, agents, tools, autonomous workers, models, sandboxes and distributed compute into one verified execution system.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  ),
  openGraph: {
    title: 'GOD Machine — Open Agentic Development OS',
    description:
      'Think. Build. Execute. Verify. Deploy. Repair. Open-source, self-hosted, model-agnostic.',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
