'use client';

import type { CSSProperties } from 'react';

import { Mushroom } from 'open-mushroom';

/* Ink and whites are custom properties read from any ancestor; sizes below 160 get a thicker stroke on their own. */
const INDIGO = { '--om-ink': '#312e81', '--om-white': '#eef2ff' } as CSSProperties;

export const ThemingExample = () => (
  <div className="flex flex-wrap items-end justify-center gap-6">
    <Mushroom emotion="neutral" size={56} />
    <Mushroom emotion="neutral" size={96} />
    <div style={INDIGO}>
      <Mushroom emotion="neutral" size={160} />
    </div>
  </div>
);
