import type { MetadataRoute } from 'next';

import { siteConfig } from '@/lib/site-config';
import { DOCS_SLUGS, docsPath } from '@/modules/docs/docs-nav';

/* Public pages in both languages; each entry lists its translations for search engines. */
const localizedEntry = (path: string): MetadataRoute.Sitemap[number] => ({
  url: `${siteConfig.siteUrl}${path}`,
  lastModified: new Date(),
  changeFrequency: 'weekly',
  alternates: {
    languages: {
      en: `${siteConfig.siteUrl}${path}`,
      uk: `${siteConfig.siteUrl}/uk${path === '/' ? '' : path}`,
      'x-default': `${siteConfig.siteUrl}${path}`,
    },
  },
});

const sitemap = (): MetadataRoute.Sitemap => [
  localizedEntry('/'),
  ...DOCS_SLUGS.map((slug) => localizedEntry(docsPath(slug))),
];

export default sitemap;
