import { describe, expect, it } from 'vitest';

import { fitCircle, fitCircleRobust } from './fit-circle';
import type { Point2 } from './knife-geometry';

/* Deterministic noise so the assertion never flakes. */
const lcg = (seed: number) => {
  let state = seed;

  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;

    return state / 4_294_967_296 - 0.5;
  };
};

const arcPoints = (count: number, spanDeg: number, noise: number): Point2[] => {
  const random = lcg(42);

  return Array.from({ length: count }, (_, i) => {
    const angle = ((-spanDeg / 2 + (spanDeg * i) / (count - 1)) * Math.PI) / 180;
    const r = 40 + random() * 2 * noise;

    return [100 + r * Math.cos(angle), 100 + r * Math.sin(angle)];
  });
};

describe('fitCircle', () => {
  it('recovers a circle from a noisy 120° arc', () => {
    const circle = fitCircle(arcPoints(50, 120, 0.3));

    expect(circle.cx).toBeCloseTo(100, 0);
    expect(circle.cy).toBeCloseTo(100, 0);
    expect(circle.r).toBeCloseTo(40, 0);
    expect(Math.abs(circle.cx - 100)).toBeLessThan(0.5);
    expect(Math.abs(circle.cy - 100)).toBeLessThan(0.5);
    expect(Math.abs(circle.r - 40)).toBeLessThan(0.5);
  });

  it('rejects degenerate input', () => {
    expect(() =>
      fitCircle([
        [0, 0],
        [1, 1],
      ]),
    ).toThrow();
  });

  it('ignores gross outliers in the robust pass', () => {
    const points: Point2[] = [...arcPoints(40, 150, 0.1), [140, 160], [60, 160]];
    const circle = fitCircleRobust(points, 2);

    expect(Math.abs(circle.cx - 100)).toBeLessThan(0.5);
    expect(Math.abs(circle.r - 40)).toBeLessThan(0.5);
  });
});
