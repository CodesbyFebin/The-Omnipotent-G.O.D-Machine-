import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { JsonLd, organizationLd, websiteLd } from './_lib/jsonld';
import { SITE } from './_lib/site';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.origin),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: '%s — GOD Machine',
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.authorName, url: SITE.authorUrl }],
  generator: 'Next.js',
  keywords: SITE.keywords as unknown as string[],
  referrer: 'origin-when-cross-origin',
  creator: SITE.authorName,
  publisher: SITE.authorName,
  category: 'technology',
  classification: 'Developer Tools',
  alternates: {
    canonical: SITE.url,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    images: [
      {
        url: SITE.ogImage,
        width: 1672,
        height: 941,
        alt: `${SITE.name} — ${SITE.tagline}`,
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE.twitterHandle,
    creator: SITE.twitterHandle,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.shortDescription,
    images: [SITE.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
  // icons and manifest are auto-injected from app/icon.svg,
  // app/apple-icon.svg, and app/manifest.ts (Next.js file conventions).
  other: {
    'theme-color': '#05060a',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  colorScheme: 'dark',
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#05060a' },
    { media: '(prefers-color-scheme: light)', color: '#05060a' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <JsonLd data={organizationLd} />
        <JsonLd data={websiteLd} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
