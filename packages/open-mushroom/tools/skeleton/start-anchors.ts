import { MUSHROOM_EMOTIONS, type MushroomEmotion } from '../../src/core/constants/mushroom-emotions';
import { MUSHROOM_SLOT_IDS, type MushroomSlotId } from '../../src/core/constants/mushroom-slots';
import { pathDataBounds } from '../../src/core/helpers/path-data-bounds';
import type { MushroomEmotionFrame } from '../../src/core/types/mushroom-manifest.types';

import type { Point2 } from './knife-geometry';

/*
 * A stroke has two ends and the start rule cannot always tell them apart: a
 * nose whose wing rises as high as its bridge, or a brow whose arc and tail
 * both end low, read from either end depending on how the outline happens to
 * be sampled. Reading one emotion from the far end maps the left side of the
 * ribbon onto the right, and the shape twists as it morphs.
 *
 * So the build reads every slot once by its rule, expresses each start as a
 * fraction of that slot's own box, and lets the emotions vote. The second pass
 * then reads every emotion from the corner the majority agreed on.
 */
const startFraction = (pathData: string): Point2 => {
  const [main] = pathData.split(/(?=M)/);
  const bounds = pathDataBounds(main ?? pathData);
  const move = /^M([\d.-]+),([\d.-]+)/.exec(main ?? pathData);
  const width = Math.max(1, bounds.maxX - bounds.minX);
  const height = Math.max(1, bounds.maxY - bounds.minY);

  return [
    ((Number(move?.[1]) || bounds.minX) - bounds.minX) / width,
    ((Number(move?.[2]) || bounds.minY) - bounds.minY) / height,
  ];
};

const distance = (a: Point2, b: Point2): number => Math.hypot(a[0] - b[0], a[1] - b[1]);

/* The reading most of the others sit closest to; ties fall to the first emotion in order. */
const medoid = (points: Point2[]): Point2 =>
  points.reduce((best, candidate) =>
    points.reduce((sum, other) => sum + distance(candidate, other), 0) <
    points.reduce((sum, other) => sum + distance(best, other), 0)
      ? candidate
      : best,
  );

export const startAnchors = (
  frames: Record<MushroomEmotion, MushroomEmotionFrame>,
): Partial<Record<MushroomSlotId, Point2>> => {
  const anchors: Partial<Record<MushroomSlotId, Point2>> = {};

  for (const slot of MUSHROOM_SLOT_IDS) {
    const fractions = MUSHROOM_EMOTIONS.map((emotion) => frames[emotion].slots[slot])
      .filter((pathData): pathData is string => pathData !== null)
      .map((pathData) => startFraction(pathData));

    if (fractions.length > 1) anchors[slot] = medoid(fractions);
  }

  return anchors;
};
