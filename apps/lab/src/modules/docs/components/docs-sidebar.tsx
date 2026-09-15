'use client';

import { useRef } from 'react';

import { useTranslations } from 'next-intl';

import { DocsNavList } from '@/modules/docs/components/docs-nav-list';

/* Sticky column from lg; below that a disclosure above the article, closed again once a page is picked. */
export const DocsSidebar = () => {
  const t = useTranslations('docs.nav');
  const detailsRef = useRef<HTMLDetailsElement>(null);

  return (
    <>
      <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
        <DocsNavList />
      </aside>
      <details ref={detailsRef} className="rounded-2xl border border-border bg-card p-3 lg:hidden">
        <summary className="cursor-pointer px-1 text-sm font-semibold">{t('label')}</summary>
        <div className="pt-3">
          <DocsNavList
            onNavigate={() => {
              if (detailsRef.current) detailsRef.current.open = false;
            }}
          />
        </div>
      </details>
    </>
  );
};
