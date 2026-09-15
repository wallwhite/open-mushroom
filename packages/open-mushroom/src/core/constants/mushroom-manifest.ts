import emotionsJson from '../generated/mushroom-emotions.generated.json';
import hatJson from '../generated/mushroom-hat.generated.json';
import type { MushroomEmotionFrame, MushroomHat, MushroomManifest } from '../types/mushroom-manifest.types';
import type { MushroomEmotion } from './mushroom-emotions';

/*
 * The generated skeleton, typed against the hand-written manifest interfaces.
 * The JSON is produced by the skeleton pipeline and guarded by the manifest
 * invariants test (which validates it through the zod schema), so the runtime
 * trusts it and ships no validation code. The assertion is needed because
 * JSON arrays widen to `number[]` while a registration translate is a pair.
 */
export const MUSHROOM_MANIFEST = emotionsJson as MushroomManifest;

export const MUSHROOM_FRAMES: Record<MushroomEmotion, MushroomEmotionFrame> = MUSHROOM_MANIFEST.emotions;

export const MUSHROOM_FACE_SPACE = MUSHROOM_MANIFEST.faceSpace;

export const MUSHROOM_HAT: MushroomHat = hatJson;
