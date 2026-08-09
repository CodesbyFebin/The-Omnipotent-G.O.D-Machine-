import type { MetadataRoute } from 'next';
import { SITE } from './_lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // /app is the protected dashboard; there's nothing meaningful to
        // index there, and crawlers should not attempt authenticated
        // routes.
        disallow: ['/app', '/api/'],
      },
    ],
    sitemap: `${SITE.origin}/sitemap.xml`,
    host: SITE.origin,
  };
}
