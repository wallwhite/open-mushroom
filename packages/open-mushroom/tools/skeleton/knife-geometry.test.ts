import { describe, expect, it } from 'vitest';

import { expandConvexPolygon, type Knife, knifePolygon, type Point2 } from './knife-geometry';

/* Point-in-convex-polygon by consistent cross-product sign. */
const contains = (polygon: readonly Point2[], [x, y]: Point2): boolean => {
  const signs = polygon.map((p, i) => {
    const q = polygon[(i + 1) % polygon.length] as Point2;

    return Math.sign((q[0] - p[0]) * (y - p[1]) - (q[1] - p[1]) * (x - p[0]));
  });

  return signs.every((sign) => sign >= 0) || signs.every((sign) => sign <= 0);
};

const HALF_PLANE: Extract<Knife, { kind: 'half-plane' }> = {
  kind: 'half-plane',
  a: [960, 331],
  b: [840, 362],
  keep: [1000, 200],
};
const FAR = 2000;
const NEAR = 5;

describe('half-plane knife', () => {
  const polygon = knifePolygon(HALF_PLANE);
  const dir: Point2 = [840 - 960, 362 - 331];
  const len = Math.hypot(dir[0], dir[1]);
  const unit: Point2 = [dir[0] / len, dir[1] / len];
  /* Normal pointing to the keep side (upwards, towards y = 200, on this line). */
  const normal: Point2 = [-unit[1], unit[0]];

  it('is a quad that contains keep and excludes its mirror image', () => {
    expect(polygon).toHaveLength(4);
    expect(contains(polygon, HALF_PLANE.keep)).toBe(true);
    const mirror: Point2 = [960 + (960 - 1000), 331 + (331 - 200)];

    expect(contains(polygon, mirror)).toBe(false);
  });

  it('reaches far beyond a and b along the line, like a half-plane and unlike a strip', () => {
    const farAlong: Point2 = [960 - unit[0] * FAR + normal[0] * NEAR, 331 - unit[1] * FAR + normal[1] * NEAR];

    expect(contains(polygon, farAlong)).toBe(true);
    expect(contains(knifePolygon({ ...HALF_PLANE, depth: 100 }), farAlong)).toBe(false);
  });
});

describe('expandConvexPolygon', () => {
  const square: Point2[] = [
    [0, 0],
    [10, 0],
    [10, 10],
    [0, 10],
  ];

  it('grows every edge outward by the distance regardless of winding', () => {
    const grown = expandConvexPolygon(square, 1.5);
    const reversed = expandConvexPolygon([...square].reverse(), 1.5);
    const key = (points: Point2[]): string =>
      points
        .map(([x, y]) => `${x.toFixed(3)},${y.toFixed(3)}`)
        .sort()
        .join(' ');

    expect(key(grown)).toBe(
      key([
        [-1.5, -1.5],
        [11.5, -1.5],
        [11.5, 11.5],
        [-1.5, 11.5],
      ]),
    );
    expect(key(reversed)).toBe(key(grown));
    expect(expandConvexPolygon(square, 0)).toEqual(square);
  });
});
