import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import { type AppLocale, routing } from '@/i18n/routing';
import { DocArticle, docMetadata } from '@/modules/docs/components/doc-article';
import { DOCS_INDEX_SLUG, DOCS_SLUGS, type DocsSlug } from '@/modules/docs/docs-nav';
import { hasDoc } from '@/modules/docs/docs-registry';

interface DocPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

/* Only the listed pages exist; anything else is a 404 rather than a render attempt. */
export const dynamicParams = false;

export const generateStaticParams = (): Array<{ slug: DocsSlug }> =>
  DOCS_SLUGS.filter((slug) => slug !== DOCS_INDEX_SLUG).map((slug) => ({ slug }));

const resolveParams = async (params: DocPageProps['params']): Promise<{ locale: AppLocale; slug: DocsSlug }> => {
  const { locale, slug } = await params;

  /* The introduction has its canonical home at /docs; a second address for it would only split the links. */
  if (!hasLocale(routing.locales, locale) || !hasDoc(slug) || slug === DOCS_INDEX_SLUG) notFound();

  return { locale, slug };
};

export const generateMetadata = async ({ params }: DocPageProps): Promise<Metadata> => {
  const { locale, slug } = await resolveParams(params);

  return docMetadata(slug, locale);
};

const DocPage = async ({ params }: DocPageProps) => {
  const { locale, slug } = await resolveParams(params);

  return <DocArticle slug={slug} locale={locale} />;
};

export default DocPage;
