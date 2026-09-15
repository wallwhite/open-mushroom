import type { ReactNode } from 'react';

import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { siteConfig } from '@/lib/site-config';
import { GithubMarkIcon } from '@/components/icons/github-mark-icon';
import { PageContainer } from '@/components/layout/page-container';

/* The accented half of the wordmark, kept out of the render so the tag is the same function every time. */
const accent = (chunks: ReactNode) => <span className="text-primary">{chunks}</span>;

/* Shares the content container with the page and the footer: the wordmark on the left, an outline pill to the repository on the right. */
export const SiteHeader = () => {
  const t = useTranslations('header');

  return (
    <header className="py-4">
      <PageContainer className="flex items-center justify-between gap-4">
        {/* A wordmark rather than a sentence: the accent travels with the catalogue string. */}
        <Link href="/" className="text-lg font-bold tracking-tight">
          {t.rich('title', { accent })}
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
