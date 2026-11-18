import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/engine/__tests__/auditShard.*.audit.ts'],
    globalSetup: ['src/engine/__tests__/auditGlobalSetup.ts'],
    testTimeout: 900000,
  },
});
