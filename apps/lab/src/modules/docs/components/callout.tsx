import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

const TONES = {
  note: 'border-pastel-blue bg-pastel-blue/50',
  warning: 'border-pastel-yellow bg-pastel-yellow/70',
} as const;

interface CalloutProps {
  children: ReactNode;
  tone?: keyof typeof TONES;
  title?: string;
}

/* An aside for the one thing a reader must not miss on a page. */
export const Callout = ({ tone = 'note', title, children }: CalloutProps) => (
  <aside className={cn('not-prose my-5 rounded-2xl border px-4 py-3 text-sm leading-relaxed', TONES[tone])}>
    {title ? <p className="mb-1 font-semibold">{title}</p> : null}
    <div className="[&_code]:rounded [&_code]:bg-white/70 [&_code]:px-1 [&_p]:m-0">{children}</div>
  </aside>
);
