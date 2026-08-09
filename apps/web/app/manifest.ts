import type { MetadataRoute } from 'next';
import { SITE } from './_lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.legalName,
    short_name: SITE.name,
    description: SITE.description,
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#05060a',
    theme_color: '#05060a',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'any',
      },
      {
        src: '/apple-icon.svg',
        type: 'image/svg+xml',
        sizes: '180x180',
        purpose: 'any',
      },
    ],
    categories: ['developer', 'productivity', 'utilities'],
  };
}
