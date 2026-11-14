import { defineConfig } from 'vitest/config';

/**
 * Test runner settings for the API.
 * Test files share one in-memory MongoDB, so they run one after another.
 * The generous hook timeout covers the first run, which downloads the
 * MongoDB binary used by mongodb-memory-server.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['tests/setup.js'],
    fileParallelism: false,
    hookTimeout: 300000,
    testTimeout: 30000,
  },
});
