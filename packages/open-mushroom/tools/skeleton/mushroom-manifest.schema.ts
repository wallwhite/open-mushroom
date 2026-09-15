import { z } from 'zod';

import { MUSHROOM_EMOTIONS, type MushroomEmotion } from '../../src/core/constants/mushroom-emotions';
import { MUSHROOM_SLOT_IDS, type MushroomSlotId } from '../../src/core/constants/mushroom-slots';
import type { MushroomHat, MushroomManifest } from '../../src/core/types/mushroom-manifest.types';

/*
 * Contract between the skeleton pipeline (validates before writing the
 * generated JSON) and the manifest invariants test. The package runtime never
 * imports it: the generated JSON is trusted at runtime and guarded by tests,
 * which keeps validation out of the shipped bundle. `satisfies` checks that
 * the schema output fits the hand-written manifest types; the invariants test
 * checks the other direction, so the two cannot drift.
 */

/* SVG path data as emitted by paper.js: absolute moveto + relative/absolute commands. */
const pathDataSchema = z.string().regex(/^[Mm][\d\s,.A-Za-z-]+$/);

export const mushroomPointSchema = z.object({ x: z.number(), y: z.number() });

export const mushroomCircleSchema = z.object({ cx: z.number(), cy: z.number(), r: z.number().positive() });

const slotShape = Object.fromEntries(MUSHROOM_SLOT_IDS.map((slot) => [slot, pathDataSchema.nullable()])) as Record<
  MushroomSlotId,
  z.ZodNullable<typeof pathDataSchema>
>;

export const mushroomRegistrationSchema = z.object({
  scale: z.number().positive(),
  rotateDeg: z.number(),
  translate: z.tuple([z.number(), z.number()]),
});

export const mushroomEmotionFrameSchema = z.object({
  slots: z.object(slotShape),
  pupils: z.object({ left: mushroomCircleSchema.nullable(), right: mushroomCircleSchema.nullable() }),
  anchors: z.object({
    eyeLeft: mushroomPointSchema,
    eyeRight: mushroomPointSchema,
    mouth: mushroomPointSchema,
    hand: mushroomPointSchema.optional(),
  }),
  registration: mushroomRegistrationSchema.optional(),
});

const emotionShape = Object.fromEntries(
  MUSHROOM_EMOTIONS.map((emotion) => [emotion, mushroomEmotionFrameSchema]),
) as Record<MushroomEmotion, typeof mushroomEmotionFrameSchema>;

const sha256Schema = z.string().regex(/^[\da-f]{64}$/);
const MIN_GRADIENT_STOPS = 2;

const shaShape = Object.fromEntries([...MUSHROOM_EMOTIONS, 'hat'].map((name) => [name, sha256Schema])) as Record<
  MushroomEmotion | 'hat',
  typeof sha256Schema
>;

export const mushroomManifestSchema = z.object({
  faceSpace: z.object({ width: z.number().positive(), height: z.number().positive() }),
  sourceSha256: z.object(shaShape),
  emotions: z.object(emotionShape),
}) satisfies z.ZodType<MushroomManifest>;

export const mushroomHatSchema = z.object({
  viewBox: z.object({ width: z.number().positive(), height: z.number().positive() }),
  d: pathDataSchema,
  gradient: z.object({
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number(),
    stops: z.array(z.object({ offset: z.number().min(0).max(1), color: z.string() })).min(MIN_GRADIENT_STOPS),
  }),
}) satisfies z.ZodType<MushroomHat>;
