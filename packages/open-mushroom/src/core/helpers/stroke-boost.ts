/*
 * Extra stroke (face-space units) painted around the ink so the lines stay
 * legible when the whole face is a few dozen CSS pixels wide. The native line
 * is ≈14 units ≈ 0.4px at a 56px mushroom, hence the generous steps.
 */
const STROKE_BOOST_STEPS: ReadonlyArray<{ maxPx: number; boost: number }> = [
  { maxPx: 44, boost: 26 },
  { maxPx: 95, boost: 18 },
  { maxPx: 159, boost: 8 },
];

export const strokeBoostForSize = (sizePx: number): number =>
  STROKE_BOOST_STEPS.find((step) => sizePx <= step.maxPx)?.boost ?? 0;
