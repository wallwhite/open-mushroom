import type { CSSProperties } from 'react';

/*
 * Paint for the face skeleton. Ink paths are filled outlines from the Figma
 * export; at small sizes the rig adds a stroke (face-space units, set per size
 * on the root as `--om-ink-stroke`) so the lines stay legible. Whites never get
 * the stroke. Inline styles keep the package free of a required stylesheet;
 * themes override the `--om-*` custom properties on any ancestor.
 */
export type MushroomPaint = 'ink' | 'white';

export const MUSHROOM_PAINT_STYLES: Record<MushroomPaint, CSSProperties> = {
  ink: {
    fill: 'var(--om-ink, #000)',
    stroke: 'var(--om-ink, #000)',
    strokeWidth: 'var(--om-ink-stroke, 0)',
    strokeLinejoin: 'round',
    strokeLinecap: 'round',
  },
  white: { fill: 'var(--om-white, #fff)' },
};

export const MUSHROOM_ROOT_STYLE: CSSProperties = { display: 'block', overflow: 'visible' };
