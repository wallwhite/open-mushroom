import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { LabInstallSnippet } from '@/modules/lab/components/lab-install-snippet';
import { buttonVariants } from '@/components/ui/button';

/* Under the character: the way into the docs and the one command that brings the mushroom into a project. */
export const LabPreviewCta = () => {
  const t = useTranslations('lab.cta');

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <Link
        href="/docs" /* Merged, so the size's radius wins over the base rounding. */
        className={cn(buttonVariants({ size: 'cta' }))}
      >
        {t('docs')}
      </Link>
      <LabInstallSnippet />
    </div>
  );
};
