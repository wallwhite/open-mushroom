import type { Point2 } from './knife-geometry';

const cross = (o: Point2, a: Point2, b: Point2): number =>
  (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);

/* Andrew's monotone chain. Returns the hull vertices in order (collinear points dropped). */
export const convexHull = (points: readonly Point2[]): Point2[] => {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);

  if (sorted.length < 3) return sorted;
  const lower: Point2[] = [];

  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower.at(-2) as Point2, lower.at(-1) as Point2, p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper: Point2[] = [];

  for (let i = sorted.length - 1; i >= 0; i -= 1) {
    const p = sorted[i] as Point2;

    while (upper.length >= 2 && cross(upper.at(-2) as Point2, upper.at(-1) as Point2, p) <= 0) upper.pop();
    upper.push(p);
  }
  lower.pop();
  upper.pop();

  return [...lower, ...upper];
};
