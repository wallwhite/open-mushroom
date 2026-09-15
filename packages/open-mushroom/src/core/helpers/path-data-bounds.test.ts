import { describe, expect, it } from 'vitest';

import { pathDataBounds } from './path-data-bounds';

describe('pathDataBounds', () => {
  it('walks absolute and relative commands', () => {
    expect(pathDataBounds('M10,10L30,10l0,20h-20z')).toEqual({ minX: 10, minY: 10, maxX: 30, maxY: 30 });
  });

  it('includes bezier control points and implicit linetos after a moveto', () => {
    expect(pathDataBounds('M0,0c10,-20 30,-20 40,0l10,5z')).toEqual({ minX: 0, minY: -20, maxX: 50, maxY: 5 });
    expect(pathDataBounds('M0,0 10,10 20,0z')).toEqual({ minX: 0, minY: 0, maxX: 20, maxY: 10 });
  });

  it('handles paper.js style negative numbers without separators', () => {
    const bounds = pathDataBounds('M515.8,392.5c0,-11.5 5.9,-21.7 14.9,-27.5v10z');

    expect(bounds.minY).toBeCloseTo(365, 0);
    expect(bounds.maxX).toBeCloseTo(530.7, 1);
  });

  it('stops on malformed data instead of producing NaN', () => {
    expect(pathDataBounds('M1,2z5')).toEqual({ minX: 1, minY: 2, maxX: 1, maxY: 2 });
  });
});
