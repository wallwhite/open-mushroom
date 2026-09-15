import type { MushroomEmotion } from '../constants/mushroom-emotions';
import type { MushroomSlotId } from '../constants/mushroom-slots';

/*
 * Shape of the generated skeleton manifests. All geometry is in "face space":
 * the 1536×1024 frame of the Figma emotion exports. The types are written by
 * hand so the public declarations stay free of validation-library types; the
 * zod schema in tools/skeleton is declared against them, so the two cannot
 * drift without a compile error.
 */
export interface MushroomPoint {
  x: number;
  y: number;
}

/* Fitted pupil disc: gaze range and blink pivots derive from it; the drawn pupil is the `pupil-*` slot. */
export interface MushroomCircle {
  cx: number;
  cy: number;
  r: number;
}

/* How an export in its own frame was placed into face space (thinking); the lab composes deltas onto it. */
export interface MushroomRegistration {
  scale: number;
  rotateDeg: number;
  translate: [number, number];
}

/* SVG path data per slot (null when the part does not exist in that emotion), pupils and anchor points. */
export interface MushroomEmotionFrame {
  slots: Record<MushroomSlotId, string | null>;
  pupils: { left: MushroomCircle | null; right: MushroomCircle | null };
  anchors: {
    eyeLeft: MushroomPoint;
    eyeRight: MushroomPoint;
    mouth: MushroomPoint;
    hand?: MushroomPoint | undefined;
  };
  registration?: MushroomRegistration | undefined;
}

export interface MushroomManifest {
  faceSpace: { width: number; height: number };
  sourceSha256: Record<MushroomEmotion | 'hat', string>;
  emotions: Record<MushroomEmotion, MushroomEmotionFrame>;
}

export interface MushroomHatGradientStop {
  offset: number;
  color: string;
}

export interface MushroomHat {
  viewBox: { width: number; height: number };
  d: string;
  gradient: { x1: number; y1: number; x2: number; y2: number; stops: MushroomHatGradientStop[] };
}
