import paper from 'paper-jsdom';
import { beforeAll, describe, expect, it } from 'vitest';

import { MUSHROOM_EMOTIONS, type MushroomEmotion } from '../../src/core/constants/mushroom-emotions';
import { MUSHROOM_SLOT_IDS, type MushroomSlotId } from '../../src/core/constants/mushroom-slots';
import manifest from '../../src/core/generated/mushroom-emotions.generated.json';

import { MUSHROOM_CUT_PLAN } from './cut-plan';
import { START_RULES, startDirection, startPointFor } from './normalize-path-start';
import { setupPaper } from './paper-context';
import { closingGap } from './path-data';
import { startAnchors } from './start-anchors';
import { ribbonWidth } from './stroke-ends';

/*
 * The shipped outlines must be what the normaliser promises: no degenerate
 * curves at the start seam, and every stroke read from the end its rule names
 * (otherwise MorphSVG pairs the wrong sides of a ribbon). Slots with an explicit
 * anchor in the cut plan are exempt from the end check.
 */
/* The seam artefact the normaliser used to leave: no chord, but handles that bulge out of the outline. */
const MIN_CHORD = 0.05;
const MAX_DEGENERATE_HANDLE = 0.5;
/* Past half a unit MorphSVG adds a closing anchor to the shape, breaking the count parity. */
const MAX_CLOSING_GAP = 0.2;
/* Two readings of one slot may differ in shape, but never point 135° apart — that is a reversed start. */
const MIN_DIRECTION_COSINE = -0.71;
/* Re-reading a shipped outline may land on the other corner of the same cut face. */
const START_WITHIN_WIDTHS = 1.2;

const subpathsOf = (pathData: string): paper.Path[] =>
  pathData.split(/(?=M)/).map((part) => new paper.Path({ pathData: part, insert: false }));

/* The generated JSON types each emotion's slots separately, so the lookup needs one shared shape. */
const slotOf = (emotion: MushroomEmotion, slot: MushroomSlotId): string | null =>
  (manifest.emotions[emotion].slots as Record<MushroomSlotId, string | null>)[slot];

describe('manifest outlines', () => {
  beforeAll(() => {
    setupPaper();
  });

  /*
   * MorphSVG pairs anchors by index and inserts points when the counts differ,
   * which shifts the pairing and twists the ribbon. Two things can break the
   * parity the build sets up: a slot resampled to a different count, and a
   * rounded path whose walk misses its start by over half a unit, which makes
   * the parser add a closing anchor to that one emotion.
   */
  it('gives a slot the same anchor count in every emotion that has it', () => {
    const anchorsOf = (pathData: string): number => (pathData.match(/,/g) ?? []).length / 3;
    const offenders: string[] = [];

    for (const slot of MUSHROOM_SLOT_IDS) {
      const drawn = MUSHROOM_EMOTIONS.map((emotion) => slotOf(emotion, slot)).filter(
        (pathData): pathData is string => pathData !== null,
      );
      const counts = drawn.map((pathData) => ({
        anchors: anchorsOf(pathData),
        subpaths: subpathsOf(pathData).length,
      }));
      // A slot drawn in two pieces in one emotion carries the same count per piece.
      const perSubpath = counts.map(({ anchors, subpaths }) => anchors / subpaths);

      if (new Set(perSubpath).size > 1) offenders.push(`${slot}: ${perSubpath.join(' ')}`);
    }
    expect(offenders).toEqual([]);
  });

  /*
   * A stroke has two ends, and reading one emotion from the far end maps the
   * left side of the ribbon onto the right: the shape twists as it morphs. The
   * two readings leave the start in opposite directions, so a near-reversal
   * between any two emotions of one slot is the signature to catch. Shapes that
   * genuinely differ (a smile against a straight lip) stay well inside this.
   */
  it('leaves every slot in a comparable direction in each emotion', () => {
    const offenders: string[] = [];

    for (const slot of MUSHROOM_SLOT_IDS) {
      const directions = MUSHROOM_EMOTIONS.map((emotion) => slotOf(emotion, slot))
        .filter((pathData): pathData is string => pathData !== null)
        .map((pathData) => startDirection(pathData));

      for (const [i, a] of directions.entries()) {
        for (const b of directions.slice(i + 1)) {
          const cosine = a[0] * b[0] + a[1] * b[1];

          if (cosine < MIN_DIRECTION_COSINE) offenders.push(`${slot}: ${cosine.toFixed(2)}`);
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it('closes every rounded subpath on the point it started from', () => {
    const offenders: string[] = [];

    for (const emotion of MUSHROOM_EMOTIONS) {
      for (const slot of MUSHROOM_SLOT_IDS) {
        const pathData = slotOf(emotion, slot);
        const gap = pathData ? closingGap(pathData) : 0;

        if (gap > MAX_CLOSING_GAP) offenders.push(`${emotion}/${slot}: ${gap.toFixed(2)}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('has no bulging zero-chord curve at a start seam', () => {
    const offenders: string[] = [];

    for (const emotion of MUSHROOM_EMOTIONS) {
      for (const slot of MUSHROOM_SLOT_IDS) {
        const pathData = slotOf(emotion, slot);

        if (!pathData) continue;
        for (const path of subpathsOf(pathData)) {
          for (const curve of path.curves) {
            const flat = curve.point1.getDistance(curve.point2) < MIN_CHORD;
            const handles = curve.segment1.handleOut.length + curve.segment2.handleIn.length;

            if (flat && handles > MAX_DEGENERATE_HANDLE) offenders.push(`${emotion}/${slot}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  /*
   * Normalising is a fixed point: reading the shipped outline again must land
   * on the start it already has. A start that moves means the rule depends on
   * how the outline happens to be sampled, and the same slot could then be read
   * from different ends in two emotions — the artefact the whole pass prevents.
   */
  it('would pick the same start again on the shipped outline', () => {
    const references = startAnchors(manifest.emotions as Parameters<typeof startAnchors>[0]);
    const offenders: string[] = [];

    for (const emotion of MUSHROOM_EMOTIONS) {
      const anchored = MUSHROOM_CUT_PLAN[emotion].starts ?? {};

      for (const slot of MUSHROOM_SLOT_IDS) {
        const pathData = slotOf(emotion, slot);
        // A part only one emotion has is cross-faded, never morphed, so where it starts cannot matter.
        const shared = MUSHROOM_EMOTIONS.filter((other) => slotOf(other, slot)).length > 1;

        if (!pathData || !shared || anchored[slot]) continue;
        const [main] = subpathsOf(pathData);

        if (!main) continue;
        const start = main.firstSegment.point;
        // Read it the way the build does: with the direction the emotions agreed on.
        const [x, y] = startPointFor(main, START_RULES[slot], references[slot]);
        const moved = Math.hypot(x - start.x, y - start.y);
        const limit = START_WITHIN_WIDTHS * ribbonWidth(main);

        if (moved >= limit) offenders.push(`${emotion}/${slot}: ${moved.toFixed(1)} > ${limit.toFixed(1)}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
