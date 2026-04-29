import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['packages/cli/src/**/*.test.ts'],
    globals: false,
  },
});
