import type { MetadataRoute } from 'next';

import { BRAND_COLORS } from '@/lib/brand-colors';
import { siteConfig } from '@/lib/site-config';

/* Bookmarked on a phone, the lab keeps its name, its colour and the character's face. */
const manifest = (): MetadataRoute.Manifest => ({
  name: `${siteConfig.name} Lab`,
  short_name: siteConfig.name,
  description: 'A living SVG mascot for React: emotions, idle life and a speech bubble.',
  start_url: '/',
  display: 'browser',
  background_color: BRAND_COLORS.background,
  theme_color: BRAND_COLORS.background,
  icons: [
    { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
    { src: '/icon.png', sizes: '32x32', type: 'image/png' },
    { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
  ],
});

export default manifest;
