import type { MushroomEmotion } from '../constants/mushroom-emotions';
import type { MorphTuning, MorphTuningTable } from '../constants/mushroom-morph-tuning';
import type { MushroomSlotId } from '../constants/mushroom-slots';

export const morphTuningKey = (from: MushroomEmotion, to: MushroomEmotion): string => `${from}->${to}`;

export const tuningFor = (
  table: MorphTuningTable,
  from: MushroomEmotion,
  to: MushroomEmotion,
  slot: MushroomSlotId,
): MorphTuning => table[morphTuningKey(from, to)]?.[slot] ?? {};
