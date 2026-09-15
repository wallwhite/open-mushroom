import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, expectTypeOf, it } from 'vitest';
import type { z } from 'zod';

import { mushroomHatSchema, mushroomManifestSchema } from '../../tools/skeleton/mushroom-manifest.schema';
import { MUSHROOM_EMOTIONS, MUSHROOM_OPEN_EYE_EMOTIONS, type MushroomEmotion } from './constants/mushroom-emotions';
import { MUSHROOM_SLOT_DEBUG_COLORS } from './constants/mushroom-slot-debug-colors';
import {
  MUSHROOM_EYE_SIDES,
  MUSHROOM_EYE_SLOTS,
  MUSHROOM_SLOT_IDS,
  type MushroomSlotId,
} from './constants/mushroom-slots';
import emotionsJson from './generated/mushroom-emotions.generated.json';
import hatJson from './generated/mushroom-hat.generated.json';
import { pathDataBounds } from './helpers/path-data-bounds';
import type { MushroomHat, MushroomManifest } from './types/mushroom-manifest.types';

/*
 * Guards the generated skeleton against a silent bad build: every emotion must
 * carry every slot, optional parts may only exist where the Figma export has
 * them, pupils must be real circles inside their whites, and the manifest must
 * be built from the committed sources.
 */
const manifest = mushroomManifestSchema.parse(emotionsJson);
const SOURCE_DIR = path.join(import.meta.dirname, '../../assets/source');
const ALL = [...MUSHROOM_EMOTIONS];
const without = (...skip: MushroomEmotion[]): MushroomEmotion[] => ALL.filter((emotion) => !skip.includes(emotion));
/* Hand pivot sits below the 1024 frame: thinking's arm enters from the bottom. */
const HAND_FRAME_FACTOR = 1.6;
/*
 * Every slot is one closed outline unless the export really draws it in pieces:
 * thinking's left lids are split by the lifted pupil, the hand has a hole, the
 * drunk squint shows two patches of white. Anything else is knife debris.
 */
const MULTI_SUBPATH_SLOTS: Partial<Record<MushroomEmotion, Partial<Record<MushroomSlotId, number>>>> = {
  thinking: { 'eye-left-ring': 2, hand: 2 },
  drunk: { 'eye-left-white': 2 },
};

const OPTIONAL_SLOT_OWNERS: Partial<Record<MushroomSlotId, MushroomEmotion[]>> = {
  hand: ['thinking'],
  'drool-ink': ['sleep'],
  'drool-white': ['sleep'],
  'dimple-right': ['staring', 'thinking'],
  'nose-side': ['staring', 'thinking'],
  'lid-fold-left': ['thinking'],
  'lid-fold-right': ['thinking'],
  'mouth-corner-left': ['neutral', 'staring', 'sleep', 'angry'],
  'mouth-corner-right': ['neutral', 'staring', 'sleep', 'angry'],
  'eye-left-white': without('sleep'),
  'eye-right-white': without('sleep'),
  'pupil-left': [...MUSHROOM_OPEN_EYE_EMOTIONS],
  'pupil-right': [...MUSHROOM_OPEN_EYE_EMOTIONS],
  chin: without('thinking'),
};

describe('mushroom manifest invariants', () => {
  it('infers from the schema exactly the hand-written manifest types', () => {
    expectTypeOf<z.infer<typeof mushroomManifestSchema>>().toEqualTypeOf<MushroomManifest>();
    expectTypeOf<z.infer<typeof mushroomHatSchema>>().toEqualTypeOf<MushroomHat>();
  });

  it('has one debug colour per slot', () => {
    expect(MUSHROOM_SLOT_DEBUG_COLORS).toHaveLength(MUSHROOM_SLOT_IDS.length);
  });

  it('carries every slot for every emotion', () => {
    for (const emotion of MUSHROOM_EMOTIONS) {
      expect(Object.keys(manifest.emotions[emotion].slots)).toEqual([...MUSHROOM_SLOT_IDS]);
    }
  });

  it('has optional parts exactly where the export has them and required parts everywhere', () => {
    for (const slot of MUSHROOM_SLOT_IDS) {
      const owners = OPTIONAL_SLOT_OWNERS[slot] ?? ALL;

      for (const emotion of MUSHROOM_EMOTIONS) {
        const present = manifest.emotions[emotion].slots[slot] !== null;

        expect(present, `${emotion}/${slot}`).toBe(owners.includes(emotion));
      }
    }
  });

  it('draws every slot as a single outline except the known multi-piece parts', () => {
    for (const emotion of MUSHROOM_EMOTIONS) {
      for (const slot of MUSHROOM_SLOT_IDS) {
        const d = manifest.emotions[emotion].slots[slot];

        if (d === null) continue;
        const subpaths = (d.match(/[Mm]/g) ?? []).length;

        expect(subpaths, `${emotion}/${slot}`).toBe(MULTI_SUBPATH_SLOTS[emotion]?.[slot] ?? 1);
      }
    }
  });

  it('has pupil circles inside the white, matching the pupil slots, exactly on open-eye emotions', () => {
    for (const emotion of MUSHROOM_EMOTIONS) {
      const frame = manifest.emotions[emotion];
      const open = (MUSHROOM_OPEN_EYE_EMOTIONS as readonly MushroomEmotion[]).includes(emotion);

      for (const side of MUSHROOM_EYE_SIDES) {
        const pupil = frame.pupils[side];
        const ink = frame.slots[MUSHROOM_EYE_SLOTS[side].pupil];

        expect(pupil !== null, `${emotion}/${side} pupil`).toBe(open);
        expect(ink !== null, `${emotion}/${side} pupil slot`).toBe(open);
        if (!pupil || !ink) continue;
        const white = pathDataBounds(frame.slots[MUSHROOM_EYE_SLOTS[side].white] ?? '');

        expect(pupil.cx).toBeGreaterThan(white.minX);
        expect(pupil.cx).toBeLessThan(white.maxX);
        expect(pupil.cy).toBeGreaterThan(white.minY);
        expect(pupil.cy).toBeLessThan(white.maxY);
        const inkBounds = pathDataBounds(ink);

        expect(Math.abs((inkBounds.minX + inkBounds.maxX) / 2 - pupil.cx)).toBeLessThan(pupil.r / 2);
        expect(inkBounds.maxX - inkBounds.minX).toBeLessThan(pupil.r * 2.5);
      }
    }
  });

  it('keeps anchors inside the face frame', () => {
    const { width, height } = manifest.faceSpace;

    for (const emotion of MUSHROOM_EMOTIONS) {
      const { anchors } = manifest.emotions[emotion];

      for (const point of [anchors.eyeLeft, anchors.eyeRight, anchors.mouth]) {
        expect(point.x).toBeGreaterThan(0);
        expect(point.x).toBeLessThan(width);
        expect(point.y).toBeGreaterThan(0);
        expect(point.y).toBeLessThan(height);
      }
      expect(anchors.hand !== undefined).toBe(emotion === 'thinking');
      if (anchors.hand) {
        expect(anchors.hand.x).toBeGreaterThan(0);
        expect(anchors.hand.x).toBeLessThan(width);
        expect(anchors.hand.y).toBeLessThan(height * HAND_FRAME_FACTOR);
      }
      expect(anchors.eyeRight.x).toBeGreaterThan(anchors.eyeLeft.x);
    }
  });

  it('was built from the committed source SVGs', () => {
    for (const name of [...MUSHROOM_EMOTIONS, 'hat'] as const) {
      const digest = createHash('sha256')
        .update(readFileSync(path.join(SOURCE_DIR, `${name}.svg`)))
        .digest('hex');

      expect(manifest.sourceSha256[name], name).toBe(digest);
    }
  });

  it('has a valid hat with a two-stop gradient', () => {
    const hat = mushroomHatSchema.parse(hatJson);

    expect(hat.gradient.stops).toHaveLength(2);
    expect(hat.viewBox.width).toBeGreaterThan(hat.viewBox.height);
  });
});
