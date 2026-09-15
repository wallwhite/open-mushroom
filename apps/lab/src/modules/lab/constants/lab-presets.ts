/* Preview sizes: the common integration sizes (header 56, floating button 64) plus readability extremes. */
export const LAB_SIZES = { tiny: 40, header: 56, fab: 64, card: 96, medium: 160, large: 240, hero: 400 } as const;

export const LAB_DEFAULT_SIZE = LAB_SIZES.large;
export const LAB_THUMB_SIZE = LAB_SIZES.header;
export const LAB_SECOND_INSTANCE_SIZE = LAB_SIZES.header;

export const LAB_BACKGROUNDS = {
  page: 'bg-background',
  card: 'bg-card shadow-card',
  fab: 'bg-primary/15',
  dark: 'bg-neutral-900',
} as const;

export type LabBackground = keyof typeof LAB_BACKGROUNDS;

/* The overlay reads live geometry from the SVG on this interval, only while an overlay is on. */
export const LAB_POLL = { overlayMs: 120 } as const;

export const LAB_COPIED_FEEDBACK_MS = 2000;
