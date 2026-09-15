'use client';

import { useEffect, useRef, useState } from 'react';

import { Check, Copy } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { LAB_COPIED_FEEDBACK_MS } from '@/modules/lab/constants/lab-presets';
import { buttonVariants } from '@/components/ui/button';

const INSTALL_COMMAND = 'npm install open-mushroom';
const noop = (): void => undefined;

/* Selecting the text is the fallback when the Clipboard API is unavailable (insecure context, older browser). */
const selectContents = (element: HTMLElement | null): void => {
  if (!element) return;
  window.getSelection()?.selectAllChildren(element);
};

export const LabInstallSnippet = () => {
  const t = useTranslations('lab.cta');
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!copied) return noop;
    const timer = window.setTimeout(() => {
      setCopied(false);
    }, LAB_COPIED_FEEDBACK_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
    } catch {
      selectContents(codeRef.current);
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-2xl border border-border bg-background py-1 pr-1 pl-4 font-mono text-sm">
      <span aria-hidden="true" className="text-muted-foreground">
        $
      </span>
      <code ref={codeRef} className="whitespace-nowrap">
        {INSTALL_COMMAND}
      </code>
      <span role="status" className="font-sans text-xs text-primary">
        {copied ? t('copied') : null}
      </span>
      <button
        type="button"
        aria-label={t('copy')}
        className={buttonVariants({ size: 'icon-sm', variant: 'ghost' })}
        onClick={() => {
          copy().catch(noop);
        }}
      >
        {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
      </button>
    </div>
  );
};
