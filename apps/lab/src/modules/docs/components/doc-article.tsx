import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { localePath } from '@/i18n/locale-path';
import type { AppLocale } from '@/i18n/routing';
import { DocsPager } from '@/modules/docs/components/docs-pager';
import { type DocsSlug, docsPath } from '@/modules/docs/docs-nav';
import { loadDoc } from '@/modules/docs/docs-registry';

interface DocArticleProps {
  slug: DocsSlug;
  locale: AppLocale;
}

/* One documentation page: the MDX content in the reader's language, then the pager. */
export const DocArticle = async ({ slug, locale }: DocArticleProps) => {
  const { default: Content } = await loadDoc(slug, locale);

  /* Links take the dark orange rather than the brand fill: the fill is a background colour and reads at 2.2:1 as text. */
  return (
    <article className="prose prose-neutral max-w-none prose-headings:font-bold prose-a:text-accent-foreground prose-code:before:content-none prose-code:after:content-none">
      <Content />
      <DocsPager slug={slug} locale={locale} />
    </article>
  );
};

/*
 * Title, description, language alternates and the social card of one page, for `generateMetadata`.
 * The Open Graph block is repeated rather than inherited: a page that sets it replaces the layout's
 * whole object, and a shared link should carry the page's own name.
 */
export const docMetadata = async (slug: DocsSlug, locale: AppLocale): Promise<Metadata> => {
  const [{ metadata }, t] = await Promise.all([
    loadDoc(slug, locale),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);
  const path = docsPath(slug);
  const { title, description } = metadata;

  return {
    title,
    description,
    alternates: {
      canonical: localePath(locale, path),
      languages: { en: localePath('en', path), uk: localePath('uk', path), 'x-default': localePath('en', path) },
    },
    openGraph: {
      type: 'article',
      siteName: t('title'),
      title,
      description,
      url: localePath(locale, path),
      locale: locale === 'uk' ? 'uk_UA' : 'en_US',
    },
    twitter: { card: 'summary_large_image', title, description },
  };
};
