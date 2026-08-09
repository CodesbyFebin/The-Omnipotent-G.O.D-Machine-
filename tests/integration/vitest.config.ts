import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    hookTimeout: 60_000,
    testTimeout: 30_000,
    setupFiles: ['./setup/global.ts'],
    // Serialize: tests share a single Postgres database. Cheaper and simpler
    // than a template DB per worker for Phase 1.
    fileParallelism: false,
    sequence: { concurrent: false },
  },
});
