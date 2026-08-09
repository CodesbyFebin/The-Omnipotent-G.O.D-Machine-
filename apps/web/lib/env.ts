/**
 * Server-only env facade. Keeps `process.env` access in one place so we can
 * surface a helpful error early rather than crashing deep inside a request.
 */

const required = ['DATABASE_URL', 'SESSION_SECRET'] as const;

export function requireEnv(name: (typeof required)[number]): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required env var ${name}. Copy .env.example to .env and start the compose stack.`,
    );
  }
  return value;
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}
