/*
 * The face skeleton: every emotion is expressed as path data for the same set of
 * slots (null when the part does not exist in that emotion). Pupils are slots
 * too (the export bites a highlight out of each disc, so a plain circle would
 * lose it); the fitted circle travels alongside as gaze metadata. Slot ids
 * double as `data-mushroom-slot` attribute values in the rig.
 */
export const MUSHROOM_SLOT_IDS = [
  'brow-left',
  'brow-right',
  'eye-left-ring',
  'lid-fold-left',
  'eye-left-white',
  'pupil-left',
  'eye-right-ring',
  'lid-fold-right',
  'eye-right-white',
  'pupil-right',
  'nose',
  'nose-side',
  'wrinkle-left',
  'wrinkle-right',
  'dimple-right',
  'under-eye-left',
  'under-eye-right',
  'mouth',
  'chin',
  'mouth-corner-left',
  'mouth-corner-right',
  'hand',
  'drool-ink',
  'drool-white',
] as const;

export type MushroomSlotId = (typeof MUSHROOM_SLOT_IDS)[number];

export const MUSHROOM_EYE_SIDES = ['left', 'right'] as const;

export type MushroomEyeSide = (typeof MUSHROOM_EYE_SIDES)[number];

/* Slots painted white; everything else is ink. */
export const MUSHROOM_WHITE_SLOTS = [
  'eye-left-white',
  'eye-right-white',
  'drool-white',
] as const satisfies readonly MushroomSlotId[];

/* Parts that appear/disappear between emotions: cross-faded, never morphed. */
export const MUSHROOM_EXTRA_SLOTS = ['hand', 'drool-ink', 'drool-white'] as const satisfies readonly MushroomSlotId[];

export const MUSHROOM_EYE_SLOTS = {
  left: { ring: 'eye-left-ring', white: 'eye-left-white', pupil: 'pupil-left' },
  right: { ring: 'eye-right-ring', white: 'eye-right-white', pupil: 'pupil-right' },
} as const satisfies Record<MushroomEyeSide, { ring: MushroomSlotId; white: MushroomSlotId; pupil: MushroomSlotId }>;

/*
 * Paint order of the ink slots (bottom → top). The Figma export paints eye
 * whites over the ring ink and the pupil over the white, so each eye ring slot
 * expands into [ring, white, pupil clipped by the white] at render time.
 * Extras go last.
 */
export const MUSHROOM_INK_PAINT_ORDER = [
  'brow-left',
  'brow-right',
  'eye-left-ring',
  'lid-fold-left',
  'eye-right-ring',
  'lid-fold-right',
  'under-eye-left',
  'under-eye-right',
  'nose',
  'nose-side',
  'wrinkle-left',
  'wrinkle-right',
  'dimple-right',
  'mouth',
  'mouth-corner-left',
  'mouth-corner-right',
  'chin',
] as const satisfies readonly MushroomSlotId[];
