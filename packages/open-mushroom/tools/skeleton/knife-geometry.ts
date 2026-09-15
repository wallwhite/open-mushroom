/*
 * Knives cut the fused Figma outlines apart. Every knife is authored in the
 * coordinates of the source SVG (not the registered face space), so changing the
 * registration of an emotion never moves its cuts. All knives are convex, which
 * keeps the outward expansion (the anti-aliasing overlap) trivial.
 */
export type Point2 = readonly [number, number];

export type Knife =
  /* Axis-aligned box. */
  | { kind: 'rect'; x1: number; y1: number; x2: number; y2: number }
  /* Rotated box that starts at `origin`, runs `length` units towards `towards`. */
  | { kind: 'strip'; origin: Point2; towards: Point2; length: number; halfWidth: number }
  /*
   * Everything on the side of line a→b that contains `keep`. `depth` is how far
   * the knife reaches from the line and beyond a and b; the default covers any
   * source canvas, a smaller value turns the knife back into a bounded box.
   */
  | { kind: 'half-plane'; a: Point2; b: Point2; keep: Point2; depth?: number };

const DEFAULT_DEPTH = 3000;

const sub = (p: Point2, q: Point2): Point2 => [p[0] - q[0], p[1] - q[1]];
const add = (p: Point2, q: Point2, k = 1): Point2 => [p[0] + q[0] * k, p[1] + q[1] * k];
const dot = (p: Point2, q: Point2): number => p[0] * q[0] + p[1] * q[1];
const normalize = (p: Point2): Point2 => {
  const len = Math.hypot(p[0], p[1]);

  if (len === 0) throw new Error('knife direction is a zero vector');

  return [p[0] / len, p[1] / len];
};

const basePolygon = (knife: Knife): Point2[] => {
  switch (knife.kind) {
    case 'rect': {
      return [
        [knife.x1, knife.y1],
        [knife.x2, knife.y1],
        [knife.x2, knife.y2],
        [knife.x1, knife.y2],
      ];
    }
    case 'strip': {
      const dir = normalize(sub(knife.towards, knife.origin));
      const normal: Point2 = [-dir[1], dir[0]];
      const far = add(knife.origin, dir, knife.length);

      return [
        add(knife.origin, normal, -knife.halfWidth),
        add(far, normal, -knife.halfWidth),
        add(far, normal, knife.halfWidth),
        add(knife.origin, normal, knife.halfWidth),
      ];
    }
    case 'half-plane': {
      const dir = normalize(sub(knife.b, knife.a));
      let normal: Point2 = [-dir[1], dir[0]];

      if (dot(normal, sub(knife.keep, knife.a)) < 0) normal = [-normal[0], -normal[1]];
      const depth = knife.depth ?? DEFAULT_DEPTH;

      // The edge is extended far along its own direction as well, so the knife is a real half-plane, not a strip.
      const start = add(knife.a, dir, -depth);
      const end = add(knife.b, dir, depth);

      return [start, end, add(end, normal, depth), add(start, normal, depth)];
    }
    default: {
      const unreachable: never = knife;

      throw new Error(`unknown knife ${JSON.stringify(unreachable)}`);
    }
  }
};

const intersectLines = (p1: Point2, d1: Point2, p2: Point2, d2: Point2): Point2 => {
  const det = d1[0] * d2[1] - d1[1] * d2[0];

  if (Math.abs(det) < 1e-9) throw new Error('knife edges are parallel');
  const t = ((p2[0] - p1[0]) * d2[1] - (p2[1] - p1[1]) * d2[0]) / det;

  return add(p1, d1, t);
};

/* Offsets every edge of a convex polygon outward by `distance`. */
export const expandConvexPolygon = (polygon: readonly Point2[], distance: number): Point2[] => {
  if (distance === 0) return [...polygon];
  const count = polygon.length;
  const centroid: Point2 = [
    polygon.reduce((sum, p) => sum + p[0], 0) / count,
    polygon.reduce((sum, p) => sum + p[1], 0) / count,
  ];
  const edges = polygon.map((p, i) => {
    const q = polygon[(i + 1) % count] as Point2;
    const dir = normalize(sub(q, p));
    let normal: Point2 = [-dir[1], dir[0]];
    const mid: Point2 = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];

    if (dot(normal, sub(mid, centroid)) < 0) normal = [-normal[0], -normal[1]];

    return { point: add(p, normal, distance), dir };
  });

  return edges.map((edge, i) => {
    const previous = edges[(i - 1 + count) % count] as (typeof edges)[number];

    return intersectLines(previous.point, previous.dir, edge.point, edge.dir);
  });
};

export const knifePolygon = (knife: Knife, expand = 0): Point2[] => expandConvexPolygon(basePolygon(knife), expand);
