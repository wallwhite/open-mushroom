import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { siteConfig } from '@/lib/site-config';
import { GithubMarkIcon } from '@/components/icons/github-mark-icon';
import { PageContainer } from '@/components/layout/page-container';

/* Shares the content container with the page and the footer: the lab title on the left, an outline pill to the repository on the right. */
export const SiteHeader = () => {
  const t = useTranslations('header');

  return (
    <header className="py-4">
      <PageContainer className="flex items-center justify-between gap-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          {t('title')}
        </Link>
        <a
          href={siteConfig.repoUrl}
          target="_blank"
          rel="noreferrer"
          aria-label={t('githubLabel')}
          className="flex h-12 items-center gap-2 rounded-full border border-border bg-card px-4 font-semibold text-foreground shadow-card transition-transform outline-none hover:scale-105 focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <GithubMarkIcon className="size-5" />
          <span className="hidden sm:inline">{t('github')}</span>
        </a>
      </PageContainer>
    </header>
  );
};
