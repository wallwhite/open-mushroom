import path from 'node:path';

import { defineConfig } from 'vitest/config';

/* Tests resolve the package from its sources, so they need no package build first (same as the dev alias). */
const packageSource = path.resolve(import.meta.dirname, '../../packages/open-mushroom/src');

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
      'open-mushroom/core': path.join(packageSource, 'core/index.ts'),
      'open-mushroom': path.join(packageSource, 'index.ts'),
    },
  },
  test: {
    name: 'open-mushroom-lab',
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
});
