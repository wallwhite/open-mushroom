import type { NextConfig } from 'next';
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
  ...(process.env.NODE_ENV === 'development' ? { turbopack: developmentAliases } : {}),
};

const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
