import { describe, expect, it } from 'vitest';

import * as core from '../core';
import * as root from '../index';

/* The runtime surface of both entries is part of the semver contract; types are checked by the compiler. */
const CORE_VALUES = [
  'ALL_IDLE_PARTS',
  'FACE_LAYOUT',
  'MUSHROOM_EMOTIONS',
  'MUSHROOM_EYE_SIDES',
  'MUSHROOM_EYE_SLOTS',
  'MUSHROOM_FRAMES',
  'MUSHROOM_SLOT_DEBUG_COLORS',
  'MUSHROOM_SLOT_IDS',
  'MUSHROOM_VIEWBOX',
  'ensureMushroomGsap',
  'faceToViewBox',
  'layoutTransform',
];

describe('public API', () => {
  it('exposes only components from the client entry, so the client boundary carries no values', () => {
    expect(Object.keys(root).sort()).toEqual(['Mushroom', 'MushroomSpeechBubble']);
    for (const value of Object.values(root)) {
      expect(typeof value).toBe('function');
    }
  });

  it('exposes exactly the documented values from the core entry', () => {
    expect(Object.keys(core).sort()).toEqual([...CORE_VALUES].sort());
  });
});
