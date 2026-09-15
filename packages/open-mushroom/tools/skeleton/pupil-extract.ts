import paper from 'paper-jsdom';

import { convexHull } from './convex-hull';
import { fitCircleRobust, type FittedCircle } from './fit-circle';
import {
  areaOf,
  childrenOf,
  distanceToBoundary,
  flattenPoints,
  intersect,
  type PathItem,
  subtract,
  unite,
} from './paper-context';

/*
 * The Figma export paints the pupil as part of the ring ink and cuts the white
 * AROUND it, so the white's concave notch is an arc of the pupil circle. We fit
 * that circle, lift the pupil ink out of the ring as its own shape (it keeps the
 * highlight the white bites out of the disc), and fill the notch back into the
 * white so it can serve as the pupil's clip while the pupil moves.
 */
export interface PupilExtraction {
  circle: FittedCircle;
  ring: PathItem;
  white: PathItem;
  pupilInk: PathItem;
}

const HULL_FLATNESS = 0.5;
const NOTCH_FLATNESS = 0.3;
const ON_BOUNDARY_DISTANCE = 0.25;
const MIN_ARC_POINTS = 8;
const OUTLIER_TOLERANCE = 0.6;
/* Share of the disc that must be ring ink; a crescent means the fit is wrong. */
const MIN_INK_SHARE = 0.4;
/* The ink disc can sit a hair off the notch circle; the margin keeps its rim with the pupil, not the ring. */
const INK_MARGIN = 1.5;

const hullOf = (item: PathItem): paper.Path =>
  new paper.Path({
    segments: convexHull(flattenPoints(item, HULL_FLATNESS)).map(([x, y]) => new paper.Point(x, y)),
    closed: true,
    insert: false,
  });

const largestChild = (item: PathItem): paper.Path =>
  childrenOf(item).reduce((best, child) => (Math.abs(child.area) > Math.abs(best.area) ? child : best));

const fitFromNotch = (hull: paper.Path, white: PathItem): FittedCircle => {
  const notch = subtract(hull, white);

  if (!notch) throw new Error('white has no notch, pupil not found');
  const arc = flattenPoints(largestChild(notch), NOTCH_FLATNESS).filter(
    (point) => distanceToBoundary(white, point) < ON_BOUNDARY_DISTANCE,
  );

  if (arc.length < MIN_ARC_POINTS) throw new Error(`notch arc too short (${arc.length} points)`);

  return fitCircleRobust(arc, OUTLIER_TOLERANCE);
};

export const extractPupil = (ring: PathItem, white: PathItem, override?: FittedCircle): PupilExtraction => {
  const hull = hullOf(white);
  const circle = override ?? fitFromNotch(hull, white);
  const disc = new paper.Path.Circle({ center: [circle.cx, circle.cy], radius: circle.r + INK_MARGIN, insert: false });
  const discInHull = intersect(disc, hull);

  if (!discInHull) throw new Error('pupil disc lies outside the white hull');
  const pupilInk = intersect(ring, discInHull);

  if (!pupilInk || areaOf(pupilInk) < MIN_INK_SHARE * Math.PI * circle.r ** 2) {
    throw new Error('pupil disc is not covered by ring ink, notch fit failed');
  }
  const ringRest = subtract(ring, pupilInk);
  const whiteFull = unite(white, discInHull);

  if (!ringRest || !whiteFull) throw new Error('pupil extraction emptied the ring or the white');

  return { circle, ring: ringRest, white: whiteFull, pupilInk };
};
