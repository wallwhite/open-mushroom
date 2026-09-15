import paper from 'paper-jsdom';

/*
 * Rebuilds an outline from a fixed number of samples spaced along it.
 *
 * MorphSVG pairs anchors by index and, when the two shapes have different
 * counts, inserts points into the longer segments of the shorter one — which
 * shifts every index after the insertion and twists the ribbon mid-morph. So
 * every emotion carries the same anchor count for a slot, evenly spaced: index
 * k is then the same fraction of the outline everywhere.
 */
const HANDLE_FRACTION = 3;
/* The tangent is read this far to each side of a sample, so a corner reports two directions. */
const TANGENT_EPSILON = 0.05;
/* A tangent jump this wide is a corner of the silhouette, not curvature. */
const CORNER_DEGREES = 20;
/* Below this turn the run is straight enough that the arc formula and chord/3 agree. */
const FLAT_TURN = 1e-4;

/* Offsets of the corners of an outline: where the tangent jumps, i.e. the ends of a cap or a knife cut. */
const cornerOffsets = (path: paper.Path): number[] =>
  path.segments
    .filter((segment) => {
      const into = segment.handleIn.isZero()
        ? segment.point.subtract(segment.previous.point)
        : segment.handleIn.multiply(-1);
      const outOf = segment.handleOut.isZero() ? segment.next.point.subtract(segment.point) : segment.handleOut;

      return !into.isZero() && !outOf.isZero() && Math.abs(into.getAngle(outOf)) > CORNER_DEGREES;
    })
    .map((segment) => segment.location.offset);

/*
 * Sample offsets: an even grid, with the nearest grid point pulled onto each
 * corner so the silhouette keeps its cap ends and cut faces crisp.
 */
const sampleOffsets = (path: paper.Path, count: number): number[] => {
  const { length } = path;
  const offsets = Array.from({ length: count }, (_, i) => (i / count) * length);
  const taken = new Set<number>();

  for (const corner of cornerOffsets(path).sort((a, b) => a - b)) {
    // A corner may only claim its own grid point, so no sample moves more than half a step and the
    // offsets keep both their order and their spacing. Two corners inside one step: the first wins and
    // the second is rounded off — a local error far smaller than dragging a distant sample onto it.
    // Slot 0 carries the start the caller just pinned, so a corner past the last step stops short of it.
    const grid = (corner / length) * count;
    const home = grid > count - 0.5 ? count - 1 : Math.round(grid);

    if (home === 0 || taken.has(home)) continue;
    taken.add(home);
    offsets[home] = corner;
  }
  // Two corners may have claimed slots out of order; sorting restores a monotonic walk of the outline.
  offsets.sort((a, b) => a - b);

  return offsets;
};

/*
 * Handle length that makes one cubic match the circular arc which leaves `from`
 * and arrives at `to` with those tangents: (2/3)·chord·tan(θ/4)/sin(θ/2), which
 * is chord/3 for a straight run and grows with the turn. Plain chord/3 would
 * cut every bend short — a percent of outline length over a whole nose.
 */
const arcHandle = (chord: number, turnRadians: number): number => {
  if (Math.abs(turnRadians) < FLAT_TURN) return chord / HANDLE_FRACTION;

  return ((2 / HANDLE_FRACTION) * chord * Math.tan(turnRadians / 4)) / Math.sin(turnRadians / 2);
};

/* Rebuilds the outline in place and returns the offsets the samples were taken from. */
export const resampleTo = (path: paper.Path, count: number): number[] => {
  const { length } = path;
  const offsets = sampleOffsets(path, count);
  const samples = offsets.map((offset) => ({
    point: path.getPointAt(offset),
    into: path.getTangentAt((offset - TANGENT_EPSILON + length) % length).normalize(),
    outOf: path.getTangentAt((offset + TANGENT_EPSILON) % length).normalize(),
  }));
  const at = (index: number): (typeof samples)[number] =>
    samples[((index % count) + count) % count] as (typeof samples)[number];
  // Handle length of the run from sample i to i + 1, shared by the two segments that meet over it.
  const runs = samples.map((sample, i) => {
    const next = at(i + 1);
    const chord = sample.point.getDistance(next.point);
    const turn = Math.abs(sample.outOf.getAngleInRadians(next.into));

    return arcHandle(chord, turn);
  });

  path.removeSegments();
  for (const [i, sample] of samples.entries()) {
    path.add(
      new paper.Segment(
        sample.point,
        sample.into.multiply(-(runs[(i - 1 + count) % count] as number)),
        sample.outOf.multiply(runs[i] as number),
      ),
    );
  }
  Object.assign(path, { closed: true });

  return offsets;
};
