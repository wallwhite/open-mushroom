import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import { routing } from '@/i18n/routing';
import { DOCS_INDEX_SLUG, DOCS_SLUGS, type DocsSlug } from '@/modules/docs/docs-nav';
import { hasDoc, loadDoc } from '@/modules/docs/docs-registry';
import { renderOgCard } from '@/modules/og/og-card';

export { OG_CONTENT_TYPE as contentType, OG_SIZE as size } from '@/modules/og/og-card';
export const alt = 'Open Mushroom';

/* One card per documentation page, drawn at build time next to the page it belongs to. */
export const generateStaticParams = (): Array<{ slug: DocsSlug }> =>
  DOCS_SLUGS.filter((slug) => slug !== DOCS_INDEX_SLUG).map((slug) => ({ slug }));

const OpenGraphImage = async ({ params }: { params: Promise<{ locale: string; slug: string }> }) => {
  const { locale, slug } = await params;

  if (!hasLocale(routing.locales, locale) || !hasDoc(slug) || slug === DOCS_INDEX_SLUG) notFound();
  const { metadata } = await loadDoc(slug, locale);

  return renderOgCard(metadata);
};

export default OpenGraphImage;
