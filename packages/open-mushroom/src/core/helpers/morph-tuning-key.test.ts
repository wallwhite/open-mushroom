import { describe, expect, it } from 'vitest';

import type { MorphTuningTable } from '../constants/mushroom-morph-tuning';
import { morphTuningKey, tuningFor } from './morph-tuning-key';

describe('morph tuning', () => {
  const table: MorphTuningTable = {
    [morphTuningKey('neutral', 'thinking')]: { mouth: { shapeIndex: 3, type: 'rotational' } },
  };

  it('keys a directed pair', () => {
    expect(morphTuningKey('neutral', 'thinking')).toBe('neutral->thinking');
  });

  it('returns the pair tuning for the slot and nothing for the reverse direction', () => {
    expect(tuningFor(table, 'neutral', 'thinking', 'mouth')).toEqual({ shapeIndex: 3, type: 'rotational' });
    expect(tuningFor(table, 'thinking', 'neutral', 'mouth')).toEqual({});
    expect(tuningFor(table, 'neutral', 'thinking', 'nose')).toEqual({});
  });
});
