import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { type AppLocale, routing } from '@/i18n/routing';
import { renderOgCard } from '@/modules/og/og-card';

export { OG_CONTENT_TYPE as contentType, OG_SIZE as size } from '@/modules/og/og-card';
export const alt = 'Open Mushroom';

/* Drawn once per language at build time, like the pages it belongs to. */
export const generateStaticParams = (): Array<{ locale: AppLocale }> => routing.locales.map((locale) => ({ locale }));

/* The share card for the lab itself: the character introduces himself rather than repeating the tab title. */
const OpenGraphImage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'lab.hero' });

  return renderOgCard({ title: t('title'), description: t('subtitle') });
};

export default OpenGraphImage;
