import type { ComponentType } from 'react';

import type { AppLocale } from '@/i18n/routing';
import type { DocsSlug } from '@/modules/docs/docs-nav';

export interface DocMetadata {
  title: string;
  description: string;
}

export interface DocModule {
  default: ComponentType;
  metadata: DocMetadata;
}

type DocLoader = () => Promise<DocModule>;

/*
 * Every page in both languages, loaded on demand. A Map rather than an object:
 * a slug such as `constructor` or `__proto__` must miss, never resolve to a
 * member of Object.prototype.
 */
const registry = new Map<DocsSlug, Record<AppLocale, DocLoader>>([
  [
    'introduction',
    {
      en: () => import('@/content/docs/en/introduction.mdx'),
      uk: () => import('@/content/docs/uk/introduction.mdx'),
    },
  ],
  [
    'emotions',
    {
      en: () => import('@/content/docs/en/emotions.mdx'),
      uk: () => import('@/content/docs/uk/emotions.mdx'),
    },
  ],
  [
    'idle-life-and-talking',
    {
      en: () => import('@/content/docs/en/idle-life-and-talking.mdx'),
      uk: () => import('@/content/docs/uk/idle-life-and-talking.mdx'),
    },
  ],
  [
    'imperative-handle',
    {
      en: () => import('@/content/docs/en/imperative-handle.mdx'),
      uk: () => import('@/content/docs/uk/imperative-handle.mdx'),
    },
  ],
  [
    'speech-bubble',
    {
      en: () => import('@/content/docs/en/speech-bubble.mdx'),
      uk: () => import('@/content/docs/uk/speech-bubble.mdx'),
    },
  ],
  [
    'theming-sizing-and-ssr',
    {
      en: () => import('@/content/docs/en/theming-sizing-and-ssr.mdx'),
      uk: () => import('@/content/docs/uk/theming-sizing-and-ssr.mdx'),
    },
  ],
  [
    'api-reference',
    {
      en: () => import('@/content/docs/en/api-reference.mdx'),
      uk: () => import('@/content/docs/uk/api-reference.mdx'),
    },
  ],
]);

export const DOCS_REGISTRY_SLUGS: readonly DocsSlug[] = [...registry.keys()];

export const hasDoc = (slug: string): slug is DocsSlug => registry.has(slug as DocsSlug);

export const loadDoc = async (slug: DocsSlug, locale: AppLocale): Promise<DocModule> => {
  const loaders = registry.get(slug);

  if (!loaders) throw new Error(`Unknown documentation page: ${slug}`);

  return loaders[locale]();
};
