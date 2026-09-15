import { describe, expect, it } from 'vitest';

import { pinnedShapeIndex, subpathCount } from './morph-shape-index';

describe('pinned shape index', () => {
  it('counts subpaths from move commands', () => {
    expect(subpathCount('M1,1l2,2z')).toBe(1);
    expect(subpathCount('M1,1l2,2zM5,5l1,1z')).toBe(2);
    expect(subpathCount(null)).toBe(0);
  });

  it('pins every subpath of the larger shape to index 0', () => {
    expect(pinnedShapeIndex('M1,1l2,2z', 'M1,1l2,2zM5,5l1,1z')).toEqual([0, 0]);
    expect(pinnedShapeIndex(null, 'M1,1l2,2z')).toEqual([0]);
  });
});
