'use client';

import { useRef } from 'react';

import { useTranslations } from 'next-intl';

import { CopyButton } from '@/components/ui/copy-button';

const INSTALL_COMMAND = 'npm install open-mushroom';

/* Selecting the text is the fallback when the Clipboard API is unavailable (insecure context, older browser). */
const selectContents = (element: HTMLElement | null): void => {
  if (!element) return;
  window.getSelection()?.selectAllChildren(element);
};

export const LabInstallSnippet = () => {
  const t = useTranslations('lab.cta');
  const codeRef = useRef<HTMLElement>(null);

  return (
    <div className="flex h-12 items-center gap-2 rounded-2xl border border-border bg-background pr-1 pl-4 font-mono text-sm">
      <span aria-hidden="true" className="text-muted-foreground">
        $
      </span>
      <code ref={codeRef} className="whitespace-nowrap">
        {INSTALL_COMMAND}
      </code>
      <CopyButton
        text={INSTALL_COMMAND}
        label={t('copy')}
        copiedLabel={t('copied')}
        onUnavailable={() => {
          selectContents(codeRef.current);
        }}
      />
    </div>
  );
};
