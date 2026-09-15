import type { Point2 } from './knife-geometry';

export interface FittedCircle {
  cx: number;
  cy: number;
  r: number;
}

type Vec3 = [number, number, number];
type Mat3 = [Vec3, Vec3, Vec3];

const MIN_POINTS = 3;
/* Below this many points every triple is tried; above, triples are sampled with a stride. */
const EXHAUSTIVE_LIMIT = 60;
const REFINE_FACTOR = 2;
const SINGULAR = 1e-9;

const det3 = ([a, b, c]: Mat3): number =>
  a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);

/* Cramer's rule; fine for a well-conditioned 3×3 system of centred sums. */
const solve3 = (m: Mat3, v: Vec3): Vec3 => {
  const d = det3(m);

  if (Math.abs(d) < SINGULAR) throw new Error('circle fit: degenerate point set');
  const withColumn = (column: number): Mat3 =>
    m.map((row, r) => row.map((value, c) => (c === column ? v[r] : value)) as Vec3) as Mat3;

  return [det3(withColumn(0)) / d, det3(withColumn(1)) / d, det3(withColumn(2)) / d];
};

/*
 * Algebraic (Kåsa) least-squares circle fit: minimises Σ (x²+y² − A·x − B·y − C)²
 * on mean-centred points. Good enough for a clean 100°+ arc, which is what a
 * pupil notch gives us.
 */
export const fitCircle = (points: readonly Point2[]): FittedCircle => {
  if (points.length < MIN_POINTS) throw new Error('circle fit needs at least 3 points');
  const meanX = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  const meanY = points.reduce((sum, p) => sum + p[1], 0) / points.length;
  const sums = { x: 0, y: 0, xx: 0, yy: 0, xy: 0, xz: 0, yz: 0, z: 0 };

  for (const [px, py] of points) {
    const x = px - meanX;
    const y = py - meanY;
    const z = x * x + y * y;

    sums.x += x;
    sums.y += y;
    sums.xx += x * x;
    sums.yy += y * y;
    sums.xy += x * y;
    sums.xz += x * z;
    sums.yz += y * z;
    sums.z += z;
  }
  const [a, b, c] = solve3(
    [
      [sums.xx, sums.xy, sums.x],
      [sums.xy, sums.yy, sums.y],
      [sums.x, sums.y, points.length],
    ],
    [sums.xz, sums.yz, sums.z],
  );
  const cx = a / 2;
  const cy = b / 2;

  return { cx: cx + meanX, cy: cy + meanY, r: Math.sqrt(c + cx * cx + cy * cy) };
};

/* Residual of a point against a circle (positive outside). */
export const circleResidual = (circle: FittedCircle, [x, y]: Point2): number =>
  Math.hypot(x - circle.cx, y - circle.cy) - circle.r;

const circumscribed = (a: Point2, b: Point2, c: Point2): FittedCircle | null => {
  const d = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));

  if (Math.abs(d) < SINGULAR) return null;
  const a2 = a[0] * a[0] + a[1] * a[1];
  const b2 = b[0] * b[0] + b[1] * b[1];
  const c2 = c[0] * c[0] + c[1] * c[1];
  const cx = (a2 * (b[1] - c[1]) + b2 * (c[1] - a[1]) + c2 * (a[1] - b[1])) / d;
  const cy = (a2 * (c[0] - b[0]) + b2 * (a[0] - c[0]) + c2 * (b[0] - a[0])) / d;

  return { cx, cy, r: Math.hypot(a[0] - cx, a[1] - cy) };
};

const countInliers = (circle: FittedCircle, points: readonly Point2[], tolerance: number): number =>
  points.filter((p) => Math.abs(circleResidual(circle, p)) <= tolerance).length;

/* Circles through well-spread point triples (every triple below EXHAUSTIVE_LIMIT points). */
const candidateCircles = function* (points: readonly Point2[]): Generator<FittedCircle> {
  const stride = Math.max(1, Math.floor(points.length / EXHAUSTIVE_LIMIT));

  for (let i = 0; i < points.length; i += stride) {
    for (let j = i + stride; j < points.length; j += stride) {
      for (let k = j + stride; k < points.length; k += stride) {
        const candidate = circumscribed(points[i] as Point2, points[j] as Point2, points[k] as Point2);

        if (candidate) yield candidate;
      }
    }
  }
};

/* The candidate circle that agrees with the most points. */
const bestConsensus = (points: readonly Point2[], tolerance: number): FittedCircle | null => {
  let best: { circle: FittedCircle; inliers: number } | null = null;

  for (const circle of candidateCircles(points)) {
    const inliers = countInliers(circle, points, tolerance);

    if (!best || inliers > best.inliers) best = { circle, inliers };
  }

  return best && best.inliers >= MIN_POINTS ? best.circle : null;
};

/*
 * Consensus fit: the winning triple's circle selects the inliers, a least-squares
 * fit over them gives the final circle. Survives boundary points that are not
 * on the arc at all (a glint outline, a neighbouring lid cap).
 */
export const fitCircleRobust = (points: readonly Point2[], tolerance: number): FittedCircle => {
  const winner = bestConsensus(points, tolerance);

  if (!winner) return fitCircle(points);
  const inliers = points.filter((p) => Math.abs(circleResidual(winner, p)) <= tolerance * REFINE_FACTOR);

  return fitCircle(inliers);
};
