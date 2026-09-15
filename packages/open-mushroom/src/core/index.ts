/*
 * Framework-free entry, safe to import from React Server Components: the
 * values an overlay, a picker or a custom integration needs. Runtime internals
 * (palettes, timings, tuning, idle profiles) stay private.
 */
export { ALL_IDLE_PARTS } from './animations/idle/idle-controller';
export type { MushroomIdleParts } from './animations/idle/idle-controller';
export { ensureMushroomGsap } from './animations/mushroom-gsap';
export type { MushroomGsap, MushroomTimeline } from './animations/mushroom-gsap';
export { MUSHROOM_BUBBLE_ANCHOR } from './constants/mushroom-bubble-anchor';
export { MUSHROOM_EMOTIONS } from './constants/mushroom-emotions';
export type { MushroomEmotion } from './constants/mushroom-emotions';
export { FACE_LAYOUT, layoutTransform, MUSHROOM_VIEWBOX } from './constants/mushroom-layout';
export { MUSHROOM_FRAMES } from './constants/mushroom-manifest';
export { MUSHROOM_SLOT_DEBUG_COLORS } from './constants/mushroom-slot-debug-colors';
export { MUSHROOM_EYE_SIDES, MUSHROOM_EYE_SLOTS, MUSHROOM_SLOT_IDS } from './constants/mushroom-slots';
export type { MushroomSlotId } from './constants/mushroom-slots';
export { faceToViewBox } from './helpers/face-anchor-origin';
export type { MushroomHandle, MushroomRigSnapshot } from './types/mushroom-handle';
export type { MushroomEmotionFrame, MushroomManifest } from './types/mushroom-manifest.types';
