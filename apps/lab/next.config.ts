import type { NextConfig } from 'next';

import createMDX from '@next/mdx';
import createNextIntlPlugin from 'next-intl/plugin';

/*
 * In development the lab follows the package sources, so an edit in the rig
 * shows up without a rebuild; production builds consume the compiled package
 * exactly like any other consumer would. Alias targets are relative to this
 * app directory (Turbopack resolves them inside the workspace root).
 */
const developmentAliases: NextConfig['turbopack'] = {
  resolveAlias: {
    'open-mushroom': '../../packages/open-mushroom/src/index.ts',
    'open-mushroom/core': '../../packages/open-mushroom/src/core/index.ts',
    'open-mushroom/styles.css': '../../packages/open-mushroom/src/styles/mushroom.css',
  },
};

const nextConfig: NextConfig = {
  transpilePackages: ['open-mushroom'],
  /* Next already keeps the highlighter external; listed here so that stays true if the default list ever changes. */
  serverExternalPackages: ['shiki'],
  ...(process.env.NODE_ENV === 'development' ? { turbopack: developmentAliases } : {}),
};

/* Plugins by name: Turbopack serialises the options for its Rust side, so functions cannot be passed here. */
const withMDX = createMDX({
  options: {
    remarkPlugins: ['remark-gfm'],
    rehypePlugins: ['rehype-slug'],
  },
});

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(withMDX(nextConfig));
