import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import { type AppLocale, routing } from '@/i18n/routing';
import { DOCS_INDEX_SLUG } from '@/modules/docs/docs-nav';
import { loadDoc } from '@/modules/docs/docs-registry';
import { renderOgCard } from '@/modules/og/og-card';

export { OG_CONTENT_TYPE as contentType, OG_SIZE as size } from '@/modules/og/og-card';
export const alt = 'Open Mushroom';

export const generateStaticParams = (): Array<{ locale: AppLocale }> => routing.locales.map((locale) => ({ locale }));

/* The documentation's front door carries the introduction's own title and summary. */
const OpenGraphImage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();
  const { metadata } = await loadDoc(DOCS_INDEX_SLUG, locale);

  return renderOgCard(metadata);
};

export default OpenGraphImage;
