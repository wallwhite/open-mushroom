import { MUSHROOM_SLOT_IDS, type MushroomSlotId } from '../../src/core/constants/mushroom-slots';

import type { AssembledEmotion } from './assemble-frame';
import { childrenOf } from './paper-context';

/*
 * MorphSVG pairs anchors by index; when two shapes differ in anchor count it
 * inserts points into the longer segments of the shorter one, which shifts
 * every later index and twists the ribbon mid-morph. So a slot gets one anchor
 * count for all emotions, sized from the longest outline it has anywhere.
 */
/* One anchor per this many units of outline: a cubic through sampled tangents then stays well under a unit off. */
const SPACING = 7;
const MIN_ANCHORS = 48;
const STEP = 4;
const MAX_ANCHORS = 320;

export const anchorBudget = (builds: AssembledEmotion[]): Record<MushroomSlotId, number> => {
  const counts = {} as Record<MushroomSlotId, number>;

  for (const slot of MUSHROOM_SLOT_IDS) {
    const longest = Math.max(
      0,
      ...builds.flatMap((build) => {
        const piece = build.pieces[slot];
        const scale = build.registrationScale;

        return piece ? childrenOf(piece).map((child) => child.length * scale) : [];
      }),
    );

    // Rounded up to a multiple of four so a knife nudged by a unit does not renumber the slot in all seven.
    const wanted = Math.ceil(longest / SPACING / STEP) * STEP;

    counts[slot] = Math.min(MAX_ANCHORS, Math.max(MIN_ANCHORS, wanted));
  }

  return counts;
};
