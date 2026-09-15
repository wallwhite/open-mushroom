import { FACE_LAYOUT, type LayerLayout } from '../constants/mushroom-layout';
import type { MushroomPoint } from '../types/mushroom-manifest.types';

const TENTHS = 10;

const round1 = (value: number): number => Math.round(value * TENTHS) / TENTHS;

/* Face-space point → viewBox coordinates (overlays drawn outside the face layout group). */
export const faceToViewBox = (point: MushroomPoint, layout: LayerLayout = FACE_LAYOUT): MushroomPoint => ({
  x: round1(layout.translate.x + point.x * layout.scale),
  y: round1(layout.translate.y + point.y * layout.scale),
});
