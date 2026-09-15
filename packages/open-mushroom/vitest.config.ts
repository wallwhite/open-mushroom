import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'open-mushroom',
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'tools/**/*.test.ts'],
  },
});
