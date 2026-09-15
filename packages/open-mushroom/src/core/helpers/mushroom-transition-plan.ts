import { MUSHROOM_EXTRA_SLOTS, MUSHROOM_SLOT_IDS, type MushroomSlotId } from '../constants/mushroom-slots';
import type { MushroomEmotionFrame } from '../types/mushroom-manifest.types';

/*
 * What has to happen to each slot to go from one frame to another. Pure, so the
 * rig's decisions are testable without a DOM: present→present morphs, a part
 * that appears gets its shape set and fades in, a part that vanishes fades out.
 */
export type TransitionOp =
  | { slot: MushroomSlotId; kind: 'morph'; to: string }
  | { slot: MushroomSlotId; kind: 'fade-in'; to: string }
  | { slot: MushroomSlotId; kind: 'fade-out' }
  | { slot: MushroomSlotId; kind: 'noop' };

const opFor = (slot: MushroomSlotId, from: string | null, to: string | null): TransitionOp => {
  if (from === null && to === null) return { slot, kind: 'noop' };
  if (from === null && to !== null) return { slot, kind: 'fade-in', to };
  if (to === null) return { slot, kind: 'fade-out' };
  if (from === to) return { slot, kind: 'noop' };
  // Extras (hand, drool) never morph: swap the shape under a fade instead of interpolating unrelated outlines.
  if ((MUSHROOM_EXTRA_SLOTS as readonly MushroomSlotId[]).includes(slot)) return { slot, kind: 'fade-in', to };

  return { slot, kind: 'morph', to };
};

export const planTransition = (from: MushroomEmotionFrame, to: MushroomEmotionFrame): TransitionOp[] =>
  MUSHROOM_SLOT_IDS.map((slot) => opFor(slot, from.slots[slot], to.slots[slot]));
