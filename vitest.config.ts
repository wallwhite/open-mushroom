import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'tooling',
          environment: 'node',
          include: ['eslint/**/*.test.ts'],
        },
      },
    ],
  },
});
