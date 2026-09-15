'use client';

import { useLocale, useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { type AppLocale, routing } from '@/i18n/routing';
import { cn } from '@/lib/utils';

const LABELS: Record<AppLocale, string> = { en: 'EN', uk: 'UK' };
const PILL = 'rounded-full px-2.5 py-1 text-xs font-semibold';

/* Keeps the current page and swaps only the locale; the proxy remembers the choice in a cookie. */
export const LocaleSwitcher = () => {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations('footer');

  return (
    <nav aria-label={t('language')} className="flex items-center gap-1 rounded-full border border-border bg-card p-1">
      {routing.locales.map((candidate) =>
        candidate === locale ? (
          /* The current language is a label, not a link back to the page it is already on. */
          <span key={candidate} aria-current="page" className={cn(PILL, 'bg-pastel-orange text-primary')}>
            {LABELS[candidate]}
          </span>
        ) : (
          <Link
            key={candidate}
            href={pathname}
            locale={candidate}
            hrefLang={candidate}
            className={cn(PILL, 'transition-colors hover:text-foreground')}
          >
            {LABELS[candidate]}
          </Link>
        ),
      )}
    </nav>
  );
};
