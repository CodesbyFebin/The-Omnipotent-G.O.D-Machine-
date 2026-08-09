import type { MetadataRoute } from 'next';
import { SITE } from './_lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const base = SITE.origin;
  const page = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly') => ({
    url: path === '/' ? base : `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });

  return [
    page('/', 1.0, 'weekly'),
    page('/god', 0.95, 'weekly'),
    page('/what-is-agentic-development-os', 0.9, 'monthly'),
    page('/what-is-a-coding-agent', 0.9, 'monthly'),
    page('/comparisons', 0.9, 'monthly'),
    page('/security', 0.85, 'monthly'),
    page('/faq', 0.85, 'monthly'),
  ];
}
