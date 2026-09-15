import type { MushroomEmotion } from '../../src/core/constants/mushroom-emotions';
import type { MushroomEyeSide, MushroomSlotId } from '../../src/core/constants/mushroom-slots';

import type { FittedCircle } from './fit-circle';
import type { Knife, Point2 } from './knife-geometry';

/*
 * Per-emotion recipe: which source <path> (0-based order in the file) feeds which
 * slot, where the knives go on the fused outlines (source coordinates, applied
 * before registration), and how `thinking` is registered into the shared face
 * space of the other six exports. Knife numbers come from scanline measurements
 * of the rasterised exports (see assets/README.md); several knives may
 * feed one slot and their pieces are united.
 */
export interface CutStep {
  from: number;
  slot: MushroomSlotId;
  knife: Knife;
}

export interface Registration {
  scale: number;
  rotateDeg: number;
  translate: [number, number];
}

/* 'auto' fits the pupil from the white's notch; a circle overrides the fit; null = no pupil. */
export type PupilSpec = 'auto' | FittedCircle | null;

export interface EmotionCutPlan {
  drops: number[];
  slots: Partial<Record<MushroomSlotId, number[]>>;
  cuts: CutStep[];
  rest: Record<number, MushroomSlotId>;
  pupils: Record<MushroomEyeSide, PupilSpec>;
  fillHoles?: MushroomSlotId[];
  registration?: Registration;
  /*
   * Where a slot's outline should start, in source coordinates, when the
   * generic start rule cannot see the anatomical end (a rounded apex where a
   * branch was cut off). The nearest outline point is used.
   */
  starts?: Partial<Record<MushroomSlotId, Point2>>;
}

/* Pieces overlap by this many source units at every cut so no seam shows. */
export const KNIFE_OVERLAP = 1.5;

const BOTH_AUTO: Record<MushroomEyeSide, PupilSpec> = { left: 'auto', right: 'auto' };
const NO_PUPILS: Record<MushroomEyeSide, PupilSpec> = { left: null, right: null };

const rect = (x1: number, y1: number, x2: number, y2: number): Knife => ({ kind: 'rect', x1, y1, x2, y2 });
const strip = (origin: [number, number], towards: [number, number], length: number, halfWidth: number): Knife => ({
  kind: 'strip',
  origin,
  towards,
  length,
  halfWidth,
});

/*
 * The left brow is an L: the arc plus the stroke descending into the nose
 * bridge, down to where it meets the upper lid. Boxes cover it in steps:
 * everything above the lid's top, then the bridge column down to the joint
 * (angry adds a box for its low outer tip). Every edge comes from a scanline
 * measurement of the source raster, never from the eye.
 */
export const MUSHROOM_CUT_PLAN: Record<MushroomEmotion, EmotionCutPlan> = {
  neutral: {
    drops: [0, 1],
    slots: {
      'brow-right': [3],
      'eye-right-ring': [4],
      'eye-right-white': [5],
      'eye-left-white': [6],
      'under-eye-left': [7],
      chin: [9],
    },
    cuts: [
      { from: 2, slot: 'brow-left', knife: rect(300, 150, 720, 330) },
      { from: 2, slot: 'brow-left', knife: rect(600, 330, 720, 340) },
      { from: 2, slot: 'brow-left', knife: rect(626, 340, 720, 362) },
      { from: 2, slot: 'eye-left-ring', knife: rect(300, 330, 627, 482) },
      // The brow's stroke runs on past the eye; it belongs to the brow all the way down to where the nose's own form starts.
      { from: 2, slot: 'brow-left', knife: strip([648, 360], [652, 488], 130, 34) },
      { from: 2, slot: 'wrinkle-left', knife: rect(560, 586, 682, 672) },
      { from: 2, slot: 'wrinkle-right', knife: strip([870, 604], [928, 648], 110, 30) },
      { from: 2, slot: 'under-eye-right', knife: strip([896, 512], [1045, 552], 180, 30) },
      // The mouth ends in two slanted ticks; they are corners of their own, like in sleep and angry.
      { from: 8, slot: 'mouth-corner-left', knife: strip([602, 725], [573, 825], 105, 18) },
      { from: 8, slot: 'mouth-corner-right', knife: strip([959, 715], [979, 815], 105, 18) },
    ],
    rest: { 2: 'nose', 8: 'mouth' },
    pupils: BOTH_AUTO,
    // Every nose is read from the cut face it shares with the brow: the wing rises just as high, so
    // "the top end" alone would pick the wing in some emotions and swap the sides of the stroke.
    starts: { nose: [652, 490] },
  },
  staring: {
    drops: [0, 1],
    slots: {
      'brow-right': [2],
      'eye-right-ring': [4],
      'eye-left-white': [5],
      'eye-right-white': [6],
      'under-eye-right': [7],
      'under-eye-left': [8],
      'dimple-right': [9],
      chin: [11],
    },
    cuts: [
      { from: 3, slot: 'brow-left', knife: rect(260, 150, 720, 284) },
      { from: 3, slot: 'brow-left', knife: rect(624, 284, 720, 306) },
      { from: 3, slot: 'eye-left-ring', knife: rect(260, 284, 620, 442) },
      { from: 3, slot: 'brow-left', knife: strip([636, 304], [651, 467], 164, 34) },
      { from: 3, slot: 'wrinkle-left', knife: rect(500, 574, 634, 652) },
      { from: 3, slot: 'wrinkle-right', knife: strip([888, 602], [958, 634], 100, 26) },
      // The far side of the nose is a loop that branches off the bridge and comes back down to a cap by the hook.
      { from: 3, slot: 'nose-side', knife: rect(690, 300, 850, 486) },
      { from: 3, slot: 'nose-side', knife: rect(740, 486, 850, 566) },
      { from: 3, slot: 'nose-side', knife: rect(740, 566, 803, 592) },
      // The left tick runs straight down, then bends left below the lip; the right one bows slightly left.
      { from: 10, slot: 'mouth-corner-left', knife: strip([590, 680], [588, 775], 100, 18) },
      { from: 10, slot: 'mouth-corner-left', knife: strip([588, 775], [541, 900], 140, 18) },
      { from: 10, slot: 'mouth-corner-right', knife: strip([997, 720], [990, 840], 125, 18) },
    ],
    rest: { 3: 'nose', 10: 'mouth' },
    pupils: BOTH_AUTO,
    // The far contour is read from where it leaves the bridge; its highest point is the arch, not an end.
    starts: { 'nose-side': [689, 488], nose: [651, 469] },
  },
  thinking: {
    drops: [0, 1, 2, 3],
    slots: {
      'brow-right': [4],
      'brow-left': [6],
      'eye-right-white': [8, 9],
      'eye-left-white': [11, 12],
      'under-eye-right': [13],
      'under-eye-left': [14],
      hand: [16],
    },
    cuts: [
      { from: 10, slot: 'wrinkle-left', knife: rect(430, 522, 528, 590) },
      { from: 10, slot: 'wrinkle-right', knife: rect(762, 462, 830, 530) },
      // The far contour runs from the top of the bridge down to a cap inside the nose; it bows right on the way.
      { from: 10, slot: 'nose-side', knife: strip([698, 286], [708, 335], 52, 16) },
      { from: 10, slot: 'nose-side', knife: strip([708, 335], [662, 470], 152, 19) },
      { from: 15, slot: 'dimple-right', knife: strip([905, 566], [942, 612], 90, 22) },
      // Eyelid folds: the arch above each upper lid, cut where its arms meet the lid.
      { from: 7, slot: 'lid-fold-left', knife: rect(290, 190, 560, 266) },
      { from: 7, slot: 'lid-fold-left', knife: rect(290, 190, 340, 279) },
      { from: 7, slot: 'lid-fold-left', knife: rect(510, 266, 565, 284) },
      { from: 5, slot: 'lid-fold-right', knife: rect(760, 140, 1040, 231) },
      { from: 5, slot: 'lid-fold-right', knife: rect(760, 231, 800, 248) },
      { from: 5, slot: 'lid-fold-right', knife: rect(994, 231, 1050, 252) },
    ],
    rest: { 10: 'nose', 15: 'mouth', 7: 'eye-left-ring', 5: 'eye-right-ring' },
    pupils: BOTH_AUTO,
    fillHoles: ['eye-left-ring', 'eye-right-ring'],
    registration: { scale: 1.103, rotateDeg: 0, translate: [37.6, 63] },
    // The nose is read from the apex of its bridge, where the far contour leaves it.
    starts: { nose: [676, 262], 'nose-side': [698, 285] },
  },
  sleep: {
    drops: [0],
    slots: {
      'brow-right': [2],
      'eye-right-ring': [3],
      'under-eye-left': [4],
      'drool-white': [6],
      'mouth-corner-right': [7],
      'mouth-corner-left': [8],
      chin: [9],
    },
    cuts: [
      { from: 1, slot: 'brow-left', knife: rect(380, 150, 800, 300) },
      { from: 1, slot: 'brow-left', knife: rect(600, 300, 720, 334) },
      { from: 1, slot: 'eye-left-ring', knife: rect(380, 334, 650, 400) },
      { from: 1, slot: 'brow-left', knife: strip([670, 332], [676, 418], 87, 34) },
      { from: 1, slot: 'wrinkle-left', knife: rect(500, 514, 690, 660) },
      { from: 1, slot: 'wrinkle-right', knife: strip([822, 530], [918, 636], 165, 30) },
      { from: 1, slot: 'under-eye-right', knife: strip([856, 446], [990, 480], 160, 30) },
      { from: 5, slot: 'drool-ink', knife: rect(806, 721, 872, 830) },
    ],
    rest: { 1: 'nose', 5: 'mouth' },
    pupils: NO_PUPILS,
    starts: { nose: [676, 420] },
  },
  excited: {
    drops: [0, 1],
    slots: {
      'brow-right': [3],
      'eye-right-ring': [4],
      'eye-left-white': [5],
      'eye-right-white': [6],
      'under-eye-left': [7],
      mouth: [8],
      chin: [9],
    },
    cuts: [
      { from: 2, slot: 'brow-left', knife: rect(320, 100, 740, 302) },
      { from: 2, slot: 'brow-left', knife: rect(650, 302, 740, 338) },
      { from: 2, slot: 'eye-left-ring', knife: rect(320, 302, 641, 472) },
      { from: 2, slot: 'brow-left', knife: strip([668, 336], [658, 478], 143, 36) },
      { from: 2, slot: 'wrinkle-left', knife: rect(560, 594, 696, 660) },
      { from: 2, slot: 'wrinkle-right', knife: strip([858, 626], [922, 662], 95, 28) },
      { from: 2, slot: 'under-eye-right', knife: strip([896, 526], [1045, 560], 175, 30) },
    ],
    rest: { 2: 'nose' },
    pupils: BOTH_AUTO,
    starts: { nose: [658, 480] },
  },
  angry: {
    drops: [0, 1],
    slots: {
      'eye-left-white': [4],
      'eye-right-white': [5],
      'under-eye-left': [6],
      mouth: [7],
      chin: [8],
      'mouth-corner-right': [9],
      'mouth-corner-left': [10],
    },
    cuts: [
      { from: 2, slot: 'brow-left', knife: rect(400, 100, 740, 254) },
      { from: 2, slot: 'brow-left', knife: rect(330, 100, 400, 275) },
      { from: 2, slot: 'brow-left', knife: rect(659, 254, 740, 318) },
      { from: 2, slot: 'eye-left-ring', knife: rect(330, 254, 658, 322) },
      { from: 2, slot: 'eye-left-ring', knife: rect(330, 322, 655, 350) },
      { from: 2, slot: 'eye-left-ring', knife: rect(330, 350, 651, 368) },
      { from: 2, slot: 'eye-left-ring', knife: rect(330, 368, 640, 432) },
      { from: 2, slot: 'brow-left', knife: strip([672, 316], [660, 456], 141, 36) },
      { from: 2, slot: 'wrinkle-left', knife: rect(400, 566, 688, 860) },
      { from: 2, slot: 'wrinkle-right', knife: strip([858, 588], [1010, 724], 200, 38) },
      { from: 2, slot: 'wrinkle-right', knife: strip([995, 710], [1040, 810], 145, 40) },
      { from: 2, slot: 'under-eye-right', knife: strip([893, 496], [1045, 528], 175, 30) },
      { from: 3, slot: 'brow-right', knife: { kind: 'half-plane', a: [960, 331], b: [840, 362], keep: [1000, 200] } },
    ],
    rest: { 2: 'nose', 3: 'eye-right-ring' },
    pupils: BOTH_AUTO,
    // The nose starts at the cut face it shares with the brow, so all emotions read it from the same end.
    starts: { nose: [660, 458] },
  },
  drunk: {
    drops: [0, 1, 2],
    slots: {
      'brow-right': [4],
      'eye-right-ring': [5],
      'eye-left-white': [6, 8],
      'eye-right-white': [7],
      'under-eye-left': [9],
      mouth: [10],
      chin: [11],
    },
    cuts: [
      { from: 3, slot: 'brow-left', knife: rect(350, 120, 760, 350) },
      { from: 3, slot: 'brow-left', knife: rect(652, 350, 720, 396) },
      { from: 3, slot: 'eye-left-ring', knife: rect(350, 366, 652, 490) },
      { from: 3, slot: 'brow-left', knife: strip([673, 394], [668, 492], 99, 36) },
      { from: 3, slot: 'wrinkle-left', knife: rect(560, 584, 692, 645) },
      { from: 3, slot: 'wrinkle-right', knife: strip([856, 606], [934, 664], 120, 30) },
      { from: 3, slot: 'under-eye-right', knife: strip([898, 524], [1030, 548], 160, 30) },
    ],
    rest: { 3: 'nose' },
    pupils: NO_PUPILS,
    fillHoles: ['eye-left-ring'],
    starts: { nose: [668, 494] },
  },
};
