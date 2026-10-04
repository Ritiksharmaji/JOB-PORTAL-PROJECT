import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Tests use their own database. Override with MONGODB_TEST_URI (e.g. a Docker MongoDB in CI).
    env: {
      NODE_ENV: 'test',
      MONGODB_URI: process.env.MONGODB_TEST_URI ?? 'mongodb://127.0.0.1:27017/jobportal_express_test',
    },
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    // Tests share one MongoDB test database, so run files one after another.
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 30_000,
  },
});
