'use client';

import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react';

import { cn } from '@/lib/utils';

type Tab = 'preview' | 'code';

interface PreviewTabsProps {
  preview: ReactNode;
  code: ReactNode;
  previewLabel: string;
  codeLabel: string;
}

/* Only the selected tab is in the tab order; the arrows reach the other one. */
const OUT_OF_TAB_ORDER = -1;

const other = (tab: Tab): Tab => (tab === 'preview' ? 'code' : 'preview');
const KEY_TARGETS: Record<string, ((tab: Tab) => Tab) | undefined> = {
  ArrowRight: other,
  ArrowLeft: other,
  Home: () => 'preview',
  End: () => 'code',
};

/* Preview / Code tabs; both panels stay mounted so the example keeps its state while the code is open. */
export const PreviewTabs = ({ preview, code, previewLabel, codeLabel }: PreviewTabsProps) => {
  const [tab, setTab] = useState<Tab>('preview');
  const id = useId();
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({ preview: null, code: null });
  const tabs: ReadonlyArray<[Tab, string]> = [
    ['preview', previewLabel],
    ['code', codeLabel],
  ];
  /* Arrows move between the two tabs and wrap, Home and End jump to the ends, as the tablist pattern expects. */
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    const next = KEY_TARGETS[event.key]?.(tab);

    if (next === undefined) return;

    event.preventDefault();
    setTab(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div className="not-prose my-6 overflow-hidden rounded-2xl border border-border bg-card">
      <div role="tablist" className="flex gap-1 border-b border-border p-1">
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            id={`${id}-${key}-tab`}
            aria-selected={tab === key}
            aria-controls={`${id}-${key}`}
            tabIndex={tab === key ? 0 : OUT_OF_TAB_ORDER}
            ref={(element) => {
              tabRefs.current[key] = element;
            }}
            className={cn(
              'rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors',
              tab === key ? 'bg-pastel-orange text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
            onKeyDown={onKeyDown}
            onClick={() => {
              setTab(key);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${id}-preview`}
        aria-labelledby={`${id}-preview-tab`}
        hidden={tab !== 'preview'}
        className="flex min-h-48 flex-col items-center justify-center gap-4 p-6"
      >
        {preview}
      </div>
      <div role="tabpanel" id={`${id}-code`} aria-labelledby={`${id}-code-tab`} hidden={tab !== 'code'}>
        {code}
      </div>
    </div>
  );
};
