import { defineConfig } from 'tsdown';

/*
 * Two ESM entries: the client entry keeps its `'use client'` directive (rolldown preserves top-level directives
 * of entry modules), the core entry stays free of it so Server Components can import constants. Peers are never
 * bundled; the manifest JSON is inlined; the stylesheet is copied next to them (the `to` of a copy entry is a directory).
 */
export default defineConfig({
  entry: { index: 'src/index.ts', core: 'src/core/index.ts' },
  format: 'esm',
  platform: 'browser',
  dts: true,
  sourcemap: true,
  clean: true,
  deps: { neverBundle: ['react', 'react-dom', 'react/jsx-runtime', 'gsap', 'gsap/MorphSVGPlugin'] },
  copy: [{ from: 'src/styles/mushroom.css', to: 'dist' }],
});
