import os from 'node:os';
import { defineConfig } from 'vitest/config';

const cpuCount = Math.max(1, os.cpus().length);

export default defineConfig({
  test: {
    include: ['src/engine/__tests__/auditShard.*.audit.ts'],
    globalSetup: ['src/engine/__tests__/auditGlobalSetup.ts'],
    maxWorkers: cpuCount,
    minWorkers: Math.min(5, cpuCount),
    testTimeout: 900000,
  },
});
