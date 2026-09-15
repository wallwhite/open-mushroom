import paper from 'paper-jsdom';

import type { MushroomSlotId } from '../../src/core/constants/mushroom-slots';

import type { Point2 } from './knife-geometry';
import { childrenOf, type PathItem } from './paper-context';
import { resampleTo } from './resample-outline';
import { resampleLoop, ribbonWidth, strokeEnds } from './stroke-ends';

/*
 * MorphSVG maps the first point of one outline onto the first point of the
 * other and walks both in their authored direction, pairing anchors by index.
 * Figma starts every outline wherever the pen happened to be and packs anchors
 * densely on bends, so the same nose in two emotions would start at opposite
 * ends and one side of the ribbon would drift onto the other halfway (the
 * black-nose artefact). Every subpath is rewritten so the identity mapping is
 * the right one and the runtime can pin shapeIndex to 0.
 */
/*
 * Which stroke end a part is read from. Vertical strokes (nose, wrinkles,
 * mouth ticks) start at their upper end, horizontal ones (brows, lip, bags,
 * chin) at their left end; loops and blobs start at their top-left extreme.
 */
export type StartRule = 'top' | 'left' | 'extreme';

export const START_RULES: Record<MushroomSlotId, StartRule> = {
  'brow-left': 'left',
  'brow-right': 'left',
  'eye-left-ring': 'extreme',
  'lid-fold-left': 'left',
  'eye-left-white': 'extreme',
  'pupil-left': 'extreme',
  'eye-right-ring': 'extreme',
  'lid-fold-right': 'left',
  'eye-right-white': 'extreme',
  'pupil-right': 'extreme',
  nose: 'top',
  'nose-side': 'top',
  'wrinkle-left': 'top',
  'wrinkle-right': 'top',
  'dimple-right': 'top',
  'under-eye-left': 'left',
  'under-eye-right': 'left',
  mouth: 'left',
  chin: 'left',
  'mouth-corner-left': 'top',
  'mouth-corner-right': 'top',
  hand: 'extreme',
  'drool-ink': 'top',
  'drool-white': 'extreme',
};

/* "Top-left" weighs height twice; used for blobs and loops, where there is no stroke end to start from. */
const TOP_LEFT_WEIGHT_Y = 2;
/* Several detected end points may sit on one cut face; ties this close read from the top-left corner. */
const END_TIE_WIDTHS = 0.25;
const EXTREME_STEP = 2;
/* How far along the outline the leaving direction is measured. */
const DIRECTION_REACH = 12;
const MIN_SEGMENTS = 3;
/*
 * Resampling must not move the outline: every rebuilt curve is checked at its
 * midpoint, where a cubic through sampled tangents is at its worst. The face is
 * 1536 units wide and the mushroom is drawn at 40-240 px, so two units is at most
 * a third of a pixel on screen — while a real mistake moves a path much further.
 */
const MAX_DEVIATION = 2.5;

const topLeftScore = ([x, y]: Point2): number => x + TOP_LEFT_WEIGHT_Y * y;

const pickEnd = (candidates: Point2[], rule: 'top' | 'left', tolerance: number): Point2 => {
  const primary: 0 | 1 = rule === 'top' ? 1 : 0;
  const secondary: 0 | 1 = primary === 1 ? 0 : 1;
  const best = Math.min(...candidates.map((point) => point[primary]));
  const tied = candidates.filter((point) => point[primary] <= best + tolerance);

  return tied.reduce((bestSoFar, point) => (point[secondary] < bestSoFar[secondary] ? point : bestSoFar));
};

/* Where a point sits inside the outline's own box, as fractions of its width and height. */
const fractionIn = (bounds: paper.Rectangle, [x, y]: Point2): Point2 => [
  (x - bounds.left) / Math.max(1, bounds.width),
  (y - bounds.top) / Math.max(1, bounds.height),
];

/* Where the subpath should start, by the slot's rule; a stroke without two detectable ends falls back to its outline. */
export const startPointFor = (path: paper.Path, rule: StartRule, reference?: Point2): Point2 => {
  const vertices = resampleLoop(path, EXTREME_STEP).map((vertex): Point2 => [vertex.x, vertex.y]);

  if (rule === 'extreme') {
    return vertices.reduce((bestSoFar, point) => (topLeftScore(point) < topLeftScore(bestSoFar) ? point : bestSoFar));
  }
  const ends = strokeEnds(path);
  const width = ribbonWidth(path);

  if (!reference) return pickEnd(ends.length >= 2 ? ends : vertices, rule, END_TIE_WIDTHS * width);
  /*
   * The other emotions agree on which corner of the slot's box the start sits
   * in. Take the end nearest that corner — or, when the stroke has no two
   * detectable ends, the outline point nearest it among those the rule allows.
   */
  const primary: 0 | 1 = rule === 'top' ? 1 : 0;
  const best = Math.min(...vertices.map((point) => point[primary]));
  const candidates = ends.length >= 2 ? ends : vertices.filter((point) => point[primary] <= best + width);
  const { bounds } = path;
  const away = (point: Point2): number => {
    const [fx, fy] = fractionIn(bounds, point);

    return Math.hypot(fx - reference[0], fy - reference[1]);
  };

  return candidates.reduce((chosen, candidate) => (away(candidate) < away(chosen) ? candidate : chosen));
};

/* The direction a serialised outline travels as it leaves its start; the build compares these across emotions. */
export const startDirection = (pathData: string): Point2 => {
  const [main] = pathData.split(/(?=M)/);
  const path = new paper.Path({ pathData: main ?? pathData, insert: false });
  const tangent = path.getTangentAt(Math.min(DIRECTION_REACH, path.length / 4)).normalize();

  return [tangent.x, tangent.y];
};

const restart = (path: paper.Path, point: Point2, clockwise: boolean): void => {
  Object.assign(path, { clockwise });
  const location = path.getNearestLocation(new paper.Point(point[0], point[1]));

  // On a closed path splitAt reopens it at the location and appends a copy of the split anchor at the end;
  // dropping that copy and closing again restores the same outline, now starting at the location.
  path.splitAt(location);
  path.lastSegment.remove();
  Object.assign(path, { closed: true });
};

const isHole = (child: paper.Path, siblings: paper.Path[]): boolean =>
  siblings.some(
    (other) =>
      other !== child && Math.abs(other.area) > Math.abs(child.area) && other.contains(child.firstSegment.point),
  );

/*
 * How far the rebuilt outline strays from the original, measured span by span
 * and in both directions: a point of the original that no longer has a curve
 * near it is detail lost, a point of the new curve with no original near it is
 * detail invented. Comparing against the matching arc rather than the whole
 * path keeps it local — a global nearest point could match the far side of a
 * ribbon and would cost a solve over every curve.
 */
const SPAN_SAMPLES = 5;

const spanDeviation = (curve: paper.Curve, original: paper.Path, from: number, to: number): number => {
  const onOriginal = Array.from({ length: SPAN_SAMPLES }, (_, k) =>
    original.getPointAt(from + ((to - from) * (k + 1)) / (SPAN_SAMPLES + 1)),
  );
  const lost = onOriginal.reduce((worst, point) => Math.max(worst, curve.getNearestPoint(point).getDistance(point)), 0);

  return Array.from({ length: SPAN_SAMPLES }, (_, k) => curve.getPointAt((curve.length * (k + 1)) / (SPAN_SAMPLES + 1)))
    .map((point) => Math.min(...onOriginal.map((other) => point.getDistance(other))))
    .reduce((worst, distance) => Math.max(worst, distance), lost);
};

const assertOnOutline = (rebuilt: paper.Path, original: paper.Path, offsets: number[], label: string): void => {
  const worst = offsets.reduce((furthest, from, index) => {
    const curve = rebuilt.curves[index];
    const to = offsets[index + 1] ?? original.length;

    return curve ? Math.max(furthest, spanDeviation(curve, original, from, to)) : furthest;
  }, 0);

  if (worst > MAX_DEVIATION) {
    throw new Error(`${label}: resampling moved the outline ${worst.toFixed(2)} units`);
  }
};

export interface NormalizeOptions {
  /* Anchor count every emotion uses for this slot. */
  count: number;
  /* Emotion and slot, so a failed check says which part of which face moved. */
  label: string;
  /* Start point in the frame's coordinates; applies to the main (largest) subpath. */
  anchor?: Point2;
  /*
   * Which corner of the slot's own box the start belongs in, as agreed by the
   * other emotions. A stroke has two ends and the rule alone cannot always tell
   * them apart — a nose whose wing rises as high as its bridge, a brow whose
   * arc and tail both end low. Starting one emotion at the far end maps the
   * left of the ribbon onto the right and the shape twists mid-morph.
   */
  reference?: Point2;
}

/*
 * Rewrites every subpath in place: outer contours clockwise and holes the other
 * way (nonzero fill), anatomical start (an explicit anchor applies to the main,
 * largest subpath), `count` anchors spaced along the outline; orders subpaths
 * largest first.
 */
export const normalizePathStart = (item: PathItem, rule: StartRule, options: NormalizeOptions): PathItem => {
  const children = [...childrenOf(item)].sort((a, b) => Math.abs(b.area) - Math.abs(a.area));

  for (const [index, child] of children.entries()) {
    if (!child.closed || child.segments.length < MIN_SEGMENTS) continue;
    const start = index === 0 && options.anchor ? options.anchor : startPointFor(child, rule, options.reference);

    restart(child, start, !isHole(child, children));
    const before = child.clone({ insert: false });

    const offsets = resampleTo(child, options.count);

    assertOnOutline(child, before, offsets, `${options.label}#${index}`);
    before.remove();
  }
  if (item instanceof paper.CompoundPath && children.length > 1) {
    for (const child of children) {
      child.remove();
      item.addChild(child);
    }
  }

  return item;
};
