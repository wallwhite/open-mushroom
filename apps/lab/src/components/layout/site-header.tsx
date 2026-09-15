import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { siteConfig } from '@/lib/site-config';
import { GithubMarkIcon } from '@/components/icons/github-mark-icon';

/* Full-width bar: the lab title on the left, an outline pill to the repository on the right. */
export const SiteHeader = () => {
  const t = useTranslations('header');

  return (
    <header className="flex w-full items-center justify-between gap-4 px-4 py-4 sm:px-8">
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
    </header>
  );
};
