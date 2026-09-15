import type { Metadata } from 'next';

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

  return (
    <article className="prose prose-neutral max-w-none prose-headings:font-bold prose-a:text-primary prose-code:before:content-none prose-code:after:content-none">
      <Content />
      <DocsPager slug={slug} locale={locale} />
    </article>
  );
};

/* Title, description and the language alternates of one page, for `generateMetadata`. */
export const docMetadata = async (slug: DocsSlug, locale: AppLocale): Promise<Metadata> => {
  const { metadata } = await loadDoc(slug, locale);
  const path = docsPath(slug);

  return {
    title: metadata.title,
    description: metadata.description,
    alternates: {
      canonical: localePath(locale, path),
      languages: { en: localePath('en', path), uk: localePath('uk', path), 'x-default': localePath('en', path) },
    },
  };
};
