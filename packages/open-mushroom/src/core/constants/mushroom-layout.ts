/*
 * Where the three layers sit inside the 640×640 viewBox. Layout transforms live
 * on their own <g>; animated groups underneath start with no transform, so GSAP
 * never multiplies a tween into a layout matrix. Numbers are tuned in the lab.
 */
export const MUSHROOM_VIEWBOX = 640;

export interface LayerLayout {
  translate: { x: number; y: number };
  scale: number;
}

/* Face space (1536×1024) → viewBox: the face content ends up centred in the blob. */
export const FACE_LAYOUT: LayerLayout = { translate: { x: 75.8, y: 205.1 }, scale: 0.315 };

/* Hat space (943×442) → viewBox: sits on top, slightly right, lower edge hidden behind the blob. */
export const HAT_LAYOUT: LayerLayout = { translate: { x: 105, y: 30 }, scale: 0.52 };

export type BodyLayerKey = 'halo' | 'tint' | 'core';

export interface BodyEllipse {
  key: BodyLayerKey;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

/* Bottom → top: a wide soft halo, an offset tint that breaks the symmetry, a dense core. */
export const BODY_ELLIPSES: readonly BodyEllipse[] = [
  { key: 'halo', cx: 320, cy: 350, rx: 295, ry: 283 },
  { key: 'tint', cx: 352, cy: 388, rx: 242, ry: 224 },
  { key: 'core', cx: 310, cy: 340, rx: 236, ry: 224 },
];

/* Radial gradient stops (offset → opacity) per body layer. */
export const BODY_GRADIENT_STOPS: Record<BodyLayerKey, ReadonlyArray<{ offset: number; opacity: number }>> = {
  halo: [
    { offset: 0, opacity: 0.6 },
    { offset: 0.7, opacity: 0.45 },
    { offset: 1, opacity: 0 },
  ],
  tint: [
    { offset: 0, opacity: 0.6 },
    { offset: 0.65, opacity: 0.3 },
    { offset: 1, opacity: 0 },
  ],
  core: [
    { offset: 0, opacity: 1 },
    { offset: 0.7, opacity: 0.85 },
    { offset: 1, opacity: 0 },
  ],
};

/* Centre of the exported face content in face space; breathing and pops scale around it. */
export const FACE_CONTENT_CENTER = { x: 774, y: 492 } as const;

export const layoutTransform = ({ translate, scale }: LayerLayout): string =>
  `translate(${translate.x} ${translate.y}) scale(${scale})`;
