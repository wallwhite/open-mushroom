'use client';

import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/utils';
import { DOCS_NAV, docsPath } from '@/modules/docs/docs-nav';

interface DocsNavListProps {
  onNavigate?: () => void;
}

/* The grouped page list; the current page is marked with `aria-current`. */
export const DocsNavList = ({ onNavigate }: DocsNavListProps) => {
  const t = useTranslations('docs.nav');
  const pathname = usePathname();

  return (
    <nav aria-label={t('label')} className="flex flex-col gap-5">
      {DOCS_NAV.map(({ group, slugs }) => (
        <div key={group}>
          <p className="mb-2 px-3 text-xs font-bold tracking-wide text-muted-foreground uppercase">
            {t(`groups.${group}`)}
          </p>
          <ul className="flex flex-col gap-0.5">
            {slugs.map((slug) => {
              const href = docsPath(slug);
              const active = pathname === href;

              return (
                <li key={slug}>
                  <Link
                    href={href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'block rounded-xl px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-pastel-orange font-semibold text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                    onClick={onNavigate}
                  >
                    {t(`pages.${slug}`)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
};
