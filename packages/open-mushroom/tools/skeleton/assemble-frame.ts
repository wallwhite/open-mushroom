import type { MushroomEmotion } from '../../src/core/constants/mushroom-emotions';
import {
  MUSHROOM_EYE_SIDES,
  MUSHROOM_EYE_SLOTS,
  MUSHROOM_SLOT_IDS,
  type MushroomEyeSide,
  type MushroomSlotId,
} from '../../src/core/constants/mushroom-slots';
import type { MushroomCircle } from '../../src/core/types/mushroom-manifest.types';

import { type EmotionCutPlan, KNIFE_OVERLAP } from './cut-plan';
import type { Point2 } from './knife-geometry';
import {
  clonePath,
  cutWithKnife,
  dropSlivers,
  fillHoles,
  loadSourceSvg,
  type PathItem,
  type SourcePath,
  unite,
  uniteAll,
} from './paper-context';
import { extractPupil } from './pupil-extract';

export type SlotPieces = Record<MushroomSlotId, PathItem | null>;

/* Everything still in source coordinates; the render check compares this against the export. */
export interface AssembledEmotion {
  emotion: MushroomEmotion;
  width: number;
  height: number;
  pieces: SlotPieces;
  pupils: Record<MushroomEyeSide, MushroomCircle | null>;
  originals: SourcePath[];
  starts: Partial<Record<MushroomSlotId, Point2>>;
  /* Registration scale, so an anchor budget can compare outlines in face space. */
  registrationScale: number;
}

const round1 = (value: number): number => Math.round(value * 10) / 10;

const emptyPieces = (): SlotPieces => Object.fromEntries(MUSHROOM_SLOT_IDS.map((slot) => [slot, null])) as SlotPieces;

type PathLookup = (index: number) => PathItem;

const lookupFor = (emotion: MushroomEmotion, source: ReturnType<typeof loadSourceSvg>): PathLookup => {
  const byIndex = new Map(source.paths.map((path) => [path.index, path]));

  return (index) => {
    const found = byIndex.get(index);

    if (!found) throw new Error(`${emotion}: source path #${index} does not exist`);

    return clonePath(found.item);
  };
};

/* Runs the knives in order; every cut takes `inside` for its slot and leaves `outside` for the next knife. */
const applyCuts = (emotion: MushroomEmotion, plan: EmotionCutPlan, pathAt: PathLookup): Partial<SlotPieces> => {
  const cut: Partial<SlotPieces> = {};
  const working = new Map<number, PathItem>();

  for (const step of plan.cuts) {
    const current = working.get(step.from) ?? pathAt(step.from);
    const { inside, outside } = cutWithKnife(current, step.knife, KNIFE_OVERLAP);

    if (!inside) throw new Error(`${emotion}: knife for ${step.slot} cut nothing from path #${step.from}`);
    // Several knives may feed one slot (an L-shaped brow needs two boxes); their pieces are united.
    const previous = cut[step.slot];
    const united = previous ? unite(previous, inside) : inside;

    if (!united) throw new Error(`${emotion}: union of the knives for ${step.slot} vanished`);
    cut[step.slot] = united;
    if (outside) working.set(step.from, outside);
    else working.delete(step.from);
  }
  for (const [index, slot] of Object.entries(plan.rest)) {
    const leftover = working.get(Number(index));

    if (!leftover) throw new Error(`${emotion}: nothing left of path #${index} for ${slot}`);
    cut[slot] = leftover;
  }
  // Knife seams leave hairline crumbs (an anti-aliased stroke edge, a 2-unit corner); drop them once a slot is complete.
  for (const [slot, piece] of Object.entries(cut) as Array<[keyof SlotPieces, PathItem]>) {
    const cleaned = dropSlivers(piece);

    if (!cleaned) throw new Error(`${emotion}: ${slot} is nothing but slivers`);
    cut[slot] = cleaned;
  }

  return cut;
};

interface LiftedPupils {
  pupils: Record<MushroomEyeSide, MushroomCircle | null>;
  replaced: Partial<SlotPieces>;
}

const liftPupils = (emotion: MushroomEmotion, plan: EmotionCutPlan, pieces: SlotPieces): LiftedPupils => {
  const pupils: Record<MushroomEyeSide, MushroomCircle | null> = { left: null, right: null };
  const replaced: Partial<SlotPieces> = {};

  for (const side of MUSHROOM_EYE_SIDES) {
    const spec = plan.pupils[side];

    if (spec === null) continue;
    const { ring: ringSlot, white: whiteSlot, pupil: pupilSlot } = MUSHROOM_EYE_SLOTS[side];
    const ring = pieces[ringSlot];
    const white = pieces[whiteSlot];

    if (!ring || !white) throw new Error(`${emotion}: ${side} eye needs both ring and white for a pupil`);
    const extraction = extractPupil(ring, white, spec === 'auto' ? undefined : spec);

    replaced[ringSlot] = extraction.ring;
    replaced[whiteSlot] = extraction.white;
    replaced[pupilSlot] = extraction.pupilInk;
    pupils[side] = {
      cx: round1(extraction.circle.cx),
      cy: round1(extraction.circle.cy),
      r: round1(extraction.circle.r),
    };
  }

  return { pupils, replaced };
};

export const assembleEmotion = (emotion: MushroomEmotion, plan: EmotionCutPlan, svg: string): AssembledEmotion => {
  const source = loadSourceSvg(svg);
  const pathAt = lookupFor(emotion, source);
  const pieces = emptyPieces();

  for (const [slot, indices] of Object.entries(plan.slots) as Array<[MushroomSlotId, number[]]>) {
    pieces[slot] = uniteAll(indices.map((index) => pathAt(index)));
  }
  Object.assign(pieces, applyCuts(emotion, plan, pathAt));
  const { pupils, replaced } = liftPupils(emotion, plan, pieces);

  Object.assign(pieces, replaced);
  // After the pupil disc is lifted, a hole that housed a glint becomes an open notch; only true holes get filled.
  for (const slot of plan.fillHoles ?? []) {
    const piece = pieces[slot];

    if (piece) pieces[slot] = fillHoles(piece);
  }

  return {
    emotion,
    width: source.width,
    height: source.height,
    pieces,
    pupils,
    originals: source.paths.filter((path) => !plan.drops.includes(path.index)),
    starts: plan.starts ?? {},
    registrationScale: plan.registration?.scale ?? 1,
  };
};
