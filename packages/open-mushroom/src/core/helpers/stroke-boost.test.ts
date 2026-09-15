import { describe, expect, it } from 'vitest';

import { strokeBoostForSize } from './stroke-boost';

describe('strokeBoostForSize', () => {
  it('adds no stroke at large sizes', () => {
    expect(strokeBoostForSize(640)).toBe(0);
    expect(strokeBoostForSize(160)).toBe(0);
  });

  it('boosts progressively as the mushroom shrinks', () => {
    expect(strokeBoostForSize(120)).toBeGreaterThan(0);
    expect(strokeBoostForSize(64)).toBeGreaterThan(strokeBoostForSize(120));
    expect(strokeBoostForSize(56)).toBe(strokeBoostForSize(64));
    expect(strokeBoostForSize(40)).toBeGreaterThan(strokeBoostForSize(56));
  });
});
