import { SITE } from './site';

/**
 * Render JSON-LD structured data. Google, Bing, and every serious AEO/GEO
 * consumer read this. Every page that wants rich results renders <JsonLd
 * data={...} /> once — pages MAY render multiple JsonLd blocks (e.g. one
 * for BreadcrumbList, one for the page's primary entity, one for FAQPage).
 *
 * All values are inlined at render time; there are no external requests.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // Next 15 supports the `suppressHydrationWarning` React attribute; the
      // stringified payload is stable per render so hydration matches.
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data, null, 0).replace(/</g, '\\u003c'),
      }}
    />
  );
}

// ---------- reusable graphs ----------

export const organizationLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE.origin}/#organization`,
  name: SITE.legalName,
  alternateName: [SITE.name, SITE.brand, 'CodingAgent', 'G.O.D Machine'],
  url: SITE.origin,
  logo: SITE.ogImage,
  sameAs: [SITE.githubUrl],
  slogan: SITE.tagline,
} as const;

export const websiteLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${SITE.origin}/#website`,
  url: SITE.origin,
  name: SITE.name,
  description: SITE.description,
  publisher: { '@id': `${SITE.origin}/#organization` },
  inLanguage: 'en',
} as const;

/**
 * SoftwareApplication for the product itself. Used on / and /god so search
 * engines understand what the site is *about* — not just that a site
 * exists.
 */
export const softwareApplicationLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${SITE.origin}/#software`,
  name: SITE.name,
  alternateName: SITE.legalName,
  applicationCategory: 'DeveloperApplication',
  applicationSubCategory: 'AI coding agent',
  operatingSystem: 'Linux, macOS, Windows, Web',
  url: SITE.url,
  downloadUrl: SITE.githubUrl,
  softwareVersion: '0.1.0-rc1',
  license: 'https://www.apache.org/licenses/LICENSE-2.0',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  description: SITE.description,
  featureList: [
    'Autonomous coding agents',
    'Multi-agent engineering swarms',
    'Model-agnostic LLM routing (local + cloud)',
    'MCP-native tool fabric',
    'Secure sandboxed execution',
    'Persistent multi-layer memory',
    'Durable mission runtime with crash recovery',
    'P99 evidence-driven verification',
    'Deployment automation and rollback',
    'Self-healing engineering workflows',
    'Row-level tenant isolation',
    'Self-hosted / local-first',
  ],
  author: { '@id': `${SITE.origin}/#organization` },
  publisher: { '@id': `${SITE.origin}/#organization` },
} as const;

export function breadcrumbLd(
  items: ReadonlyArray<{ name: string; url: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  } as const;
}

export function articleLd(input: {
  headline: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    mainEntityOfPage: { '@type': 'WebPage', '@id': input.url },
    url: input.url,
    author: { '@id': `${SITE.origin}/#organization` },
    publisher: { '@id': `${SITE.origin}/#organization` },
    datePublished: input.datePublished,
    dateModified: input.dateModified ?? input.datePublished,
    image: SITE.ogImage,
    inLanguage: 'en',
  } as const;
}

export function faqPageLd(
  items: ReadonlyArray<{ question: string; answer: string }>,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  } as const;
}

export function definedTermLd(input: {
  name: string;
  description: string;
  url: string;
  termCode?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    name: input.name,
    description: input.description,
    url: input.url,
    termCode: input.termCode ?? input.name,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      name: 'CodingAgent / GOD Machine Glossary',
      url: `${SITE.origin}/glossary`,
    },
  } as const;
}
