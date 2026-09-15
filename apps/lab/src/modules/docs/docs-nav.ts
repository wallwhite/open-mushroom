/* Reading order of the documentation; the introduction lives at /docs itself. */
export const DOCS_SLUGS = [
  'introduction',
  'emotions',
  'idle-life-and-talking',
  'imperative-handle',
  'speech-bubble',
  'theming-sizing-and-ssr',
  'api-reference',
] as const;

export type DocsSlug = (typeof DOCS_SLUGS)[number];

export type DocsGroup = 'gettingStarted' | 'guides' | 'reference';

export const DOCS_NAV: ReadonlyArray<{ group: DocsGroup; slugs: readonly DocsSlug[] }> = [
  { group: 'gettingStarted', slugs: ['introduction'] },
  {
    group: 'guides',
    slugs: ['emotions', 'idle-life-and-talking', 'imperative-handle', 'speech-bubble', 'theming-sizing-and-ssr'],
  },
  { group: 'reference', slugs: ['api-reference'] },
];

export const DOCS_INDEX_SLUG: DocsSlug = 'introduction';

export const docsPath = (slug: DocsSlug): string => (slug === DOCS_INDEX_SLUG ? '/docs' : `/docs/${slug}`);

/* The pages before and after one, in reading order. */
export const docsNeighbours = (slug: DocsSlug): { previous: DocsSlug | null; next: DocsSlug | null } => {
  const index = DOCS_SLUGS.indexOf(slug);

  return { previous: DOCS_SLUGS[index - 1] ?? null, next: DOCS_SLUGS[index + 1] ?? null };
};
