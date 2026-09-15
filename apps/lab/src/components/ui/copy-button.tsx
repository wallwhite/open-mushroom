'use client';

import { useEffect, useState } from 'react';

import { Check, Copy } from 'lucide-react';

import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

const COPIED_FEEDBACK_MS = 2000;
const noop = (): void => undefined;

interface CopyButtonProps {
  text: string;
  label: string;
  copiedLabel: string;
  /* Runs when the Clipboard API is unavailable (insecure context, older browser), e.g. to select the text instead. */
  onUnavailable?: () => void;
  className?: string;
}

/* Icon button that puts `text` on the clipboard and confirms it for two seconds: the icon changes, screen readers hear the label; nothing moves. */
export const CopyButton = ({ text, label, copiedLabel, onUnavailable, className }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return noop;
    const timer = window.setTimeout(() => {
      setCopied(false);
    }, COPIED_FEEDBACK_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [copied]);

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      onUnavailable?.();
    }
  };

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span role="status" className="sr-only">
        {copied ? copiedLabel : null}
      </span>
      <button
        type="button"
        aria-label={label}
        className={buttonVariants({ size: 'icon-sm', variant: 'ghost' })}
        onClick={() => {
          copy().catch(noop);
        }}
      >
        {copied ? <Check className="size-4 text-primary" /> : <Copy className="size-4" />}
      </button>
    </span>
  );
};
