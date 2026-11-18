import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/engine/__tests__/audit1000.audit.ts'],
    testTimeout: 900000,
  },
});
