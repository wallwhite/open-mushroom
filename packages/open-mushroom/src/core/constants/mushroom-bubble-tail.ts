/*
 * The speech bubble's tail: a small fin drawn in its own box hung under the
 * card's bottom-right corner and rotated toward the character. Its base is the
 * segment of the card's bottom edge left of the corner (`anchorPx` of it), so
 * the shape grows out of the card rather than being stuck beside it; from
 * there the outer edge sweeps down and right to a rounded tip and the inner
 * edge curves back, a soft comic-strip fin instead of a paper aeroplane.
 * Shared with the anchor, which has to keep the tail out of the body.
 */
export const MUSHROOM_BUBBLE_TAIL = {
  path: 'M0 0H18C18.5 7.5 21 14.5 27.4 21.4 28.4 22.4 27.8 23.9 26.4 23.4 14.6 19.4 5.6 11 0 0Z',
  width: 30,
  height: 25,
  /* Where the card's right edge falls inside the box. */
  anchorPx: 16,
  /* A hairline of overlap, so the two whites never show a seam between them. */
  overlapPx: 1,
  rotationDeg: -40,
} as const;

const HALF = 2;
const DEGREES_PER_TURN = 360;
const radians = (degrees: number): number => (Math.abs(degrees) / DEGREES_PER_TURN) * HALF * Math.PI;
const halfWidth = MUSHROOM_BUBBLE_TAIL.width / HALF;
const halfHeight = MUSHROOM_BUBBLE_TAIL.height / HALF;
const angle = radians(MUSHROOM_BUBBLE_TAIL.rotationDeg);

/* How far the rotated tail box reaches past the card's right edge, in CSS pixels (fixed, whatever the character's size). */
export const MUSHROOM_BUBBLE_TAIL_REACH_PX = Math.ceil(
  halfWidth - MUSHROOM_BUBBLE_TAIL.anchorPx + halfWidth * Math.cos(angle) + halfHeight * Math.sin(angle),
);
