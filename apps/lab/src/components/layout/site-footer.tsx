import { useTranslations } from 'next-intl';

import { siteConfig } from '@/lib/site-config';
import { LocaleSwitcher } from '@/components/layout/locale-switcher';
import { PageContainer } from '@/components/layout/page-container';

const linkClass = 'transition-colors hover:text-foreground';

export const SiteFooter = () => {
  const t = useTranslations('footer');

  return (
    <footer className="mt-auto py-6 text-sm text-muted-foreground">
      <PageContainer className="flex flex-wrap items-center justify-between gap-4">
        <p>
          {t('copyright')} · {t('license')}
        </p>
        <div className="flex items-center gap-4">
          <a href={siteConfig.npmUrl} target="_blank" rel="noreferrer" className={linkClass}>
            {t('npm')}
          </a>
          <a href={siteConfig.repoUrl} target="_blank" rel="noreferrer" className={linkClass}>
            {t('github')}
          </a>
          <LocaleSwitcher />
        </div>
      </PageContainer>
    </footer>
  );
};
