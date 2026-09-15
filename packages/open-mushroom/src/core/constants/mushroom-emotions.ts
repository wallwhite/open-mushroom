/* The seven facial expressions exported from Figma; the manifest carries a frame for each. */
export const MUSHROOM_EMOTIONS = ['neutral', 'staring', 'thinking', 'sleep', 'excited', 'angry', 'drunk'] as const;

export type MushroomEmotion = (typeof MUSHROOM_EMOTIONS)[number];

/*
 * Faces that are only entered and left through another one. `thinking` turns
 * the head, drops the brows and brings the hand in at once, so a direct morph
 * from any other face travels too far in one step; passing through `staring`
 * splits it into two short, readable moves.
 */
export const MUSHROOM_EMOTION_APPROACH: Partial<Record<MushroomEmotion, MushroomEmotion>> = {
  thinking: 'staring',
};

/* Emotions whose eyes are open enough to carry a visible pupil circle. */
export const MUSHROOM_OPEN_EYE_EMOTIONS = [
  'neutral',
  'staring',
  'thinking',
  'excited',
  'angry',
] as const satisfies readonly MushroomEmotion[];
