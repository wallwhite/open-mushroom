import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import type { AppLocale } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';
import { type DocsSlug, docsNeighbours, docsPath } from '@/modules/docs/docs-nav';

interface DocsPagerProps {
  slug: DocsSlug;
  locale: AppLocale;
}

const PAGER_LINK =
  'flex max-w-[48%] flex-col gap-1 rounded-2xl border border-border px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary hover:text-primary';

/* Previous / next page in reading order, and the way to the page's source. */
export const DocsPager = async ({ slug, locale }: DocsPagerProps) => {
  const t = await getTranslations('docs');
  const { previous, next } = docsNeighbours(slug);

  return (
    <footer className="not-prose mt-12 flex flex-col gap-4 border-t border-border pt-6">
      <div className="flex justify-between gap-4">
        {previous ? (
          <Link href={docsPath(previous)} rel="prev" className={PAGER_LINK}>
            <span className="text-xs font-normal text-muted-foreground">{t('pager.previous')}</span>
            {t(`nav.pages.${previous}`)}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={docsPath(next)} rel="next" className={`${PAGER_LINK} ml-auto text-right`}>
            <span className="text-xs font-normal text-muted-foreground">{t('pager.next')}</span>
            {t(`nav.pages.${next}`)}
          </Link>
        ) : null}
      </div>
      <a
        href={`${siteConfig.repoUrl}/blob/main/apps/lab/src/content/docs/${locale}/${slug}.mdx`}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
      >
        {t('pager.editOnGitHub')}
      </a>
    </footer>
  );
};
