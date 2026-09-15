import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'tooling',
          environment: 'node',
          include: ['eslint/**/*.test.ts'],
          /* Each case lints a fixture with the whole rule set and the type-aware parser; that is seconds, not milliseconds. */
          testTimeout: 30_000,
        },
      },
      'packages/open-mushroom',
      'apps/lab',
    ],
  },
});
