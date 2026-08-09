import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ['@god/schemas', '@god/db', '@god/auth', '@god/events'],
  // `serverExternalPackages` covers direct imports from app code; the webpack
  // config below covers the case where a transpiled workspace package
  // (@god/auth) is the one importing a native module (@node-rs/argon2).
  serverExternalPackages: ['@node-rs/argon2', 'postgres'],
  typedRoutes: true,
  // Silence Next's multi-lockfile warning by pinning the workspace root here.
  outputFileTracingRoot: path.resolve(__dirname, '../..'),
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = Array.isArray(config.externals)
        ? config.externals
        : [config.externals].filter(Boolean);
      config.externals = [
        ...externals,
        ({ request }: { request?: string }, callback: (err?: Error | null, result?: string) => void) => {
          if (
            request &&
            (request === '@node-rs/argon2' ||
              request.startsWith('@node-rs/argon2-') ||
              request === 'postgres')
          ) {
            return callback(null, `commonjs ${request}`);
          }
          callback();
        },
      ];
    }
    return config;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
