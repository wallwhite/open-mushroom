import type { MushroomSlotId } from './mushroom-slots';

/* MorphSVG knobs for one slot of one directed pair; `shapeIndex` is a property of the pair, not the slot. */
export interface MorphTuning {
  shapeIndex?: number | 'auto' | number[];
  type?: 'linear' | 'rotational';
}

/* Keyed by `${from}->${to}` (see morphTuningKey). Empty until the lab finds pairs that need help. */
export type MorphTuningTable = Record<string, Partial<Record<MushroomSlotId, MorphTuning>> | undefined>;

export const MUSHROOM_MORPH_TUNING: MorphTuningTable = {};
