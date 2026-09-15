import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import { type AppLocale, routing } from '@/i18n/routing';
import { DocArticle, docMetadata } from '@/modules/docs/components/doc-article';
import { DOCS_INDEX_SLUG } from '@/modules/docs/docs-nav';

interface DocsIndexPageProps {
  params: Promise<{ locale: string }>;
}

const resolveLocale = async (params: DocsIndexPageProps['params']): Promise<AppLocale> => {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  return locale;
};

export const generateMetadata = async ({ params }: DocsIndexPageProps): Promise<Metadata> =>
  docMetadata(DOCS_INDEX_SLUG, await resolveLocale(params));

/* The introduction is the documentation's front door, at /docs itself. */
const DocsIndexPage = async ({ params }: DocsIndexPageProps) => (
  <DocArticle slug={DOCS_INDEX_SLUG} locale={await resolveLocale(params)} />
);

export default DocsIndexPage;
