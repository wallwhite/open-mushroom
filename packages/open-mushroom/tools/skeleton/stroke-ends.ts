import paper from 'paper-jsdom';

import type { Point2 } from './knife-geometry';

/*
 * Finds the ends of a stroke ribbon from its filled outline. Every resampled
 * outline point casts a ray inward: along the sides the shape is about one
 * ribbon width deep, on an end the ray runs the length of the stroke. The outer
 * corner of a bend is deep on both faces too, so a caller that needs one
 * specific end must still choose among the candidates (see START_RULES).
 */
const FLATNESS = 0.4;
/* Resampling step along the outline, as a fraction of the ribbon width (knife cut faces need interior points). */
const STEP_WIDTHS = 0.25;
const MIN_STEP = 2;
const MIN_WIDTH = 4;
/* An outline point is on a stroke end when the shape is this many widths deep behind it. */
const END_DEPTH_WIDTHS = 2.5;
const RAY_OFFSET = 0.5;
const INSIDE_PROBE = 2;

export interface OutlineVertex {
  x: number;
  y: number;
  tx: number;
  ty: number;
}

/* Mean width of a ribbon: twice the area over the perimeter. */
export const ribbonWidth = (path: paper.Path): number => Math.max(MIN_WIDTH, (2 * Math.abs(path.area)) / path.length);

/* The outline as a closed polyline with roughly even spacing and a tangent at every vertex. */
export const resampleLoop = (path: paper.Path, step: number): OutlineVertex[] => {
  const copy = path.clone({ insert: false });

  copy.flatten(FLATNESS);
  const corners = copy.segments.map((segment): Point2 => [segment.point.x, segment.point.y]);

  copy.remove();
  const points: Point2[] = [];

  corners.forEach((corner, i) => {
    const next = corners[(i + 1) % corners.length] as Point2;
    const length = Math.hypot(next[0] - corner[0], next[1] - corner[1]);
    const pieces = Math.max(1, Math.round(length / step));

    for (let k = 0; k < pieces; k++) {
      const t = k / pieces;

      points.push([corner[0] + (next[0] - corner[0]) * t, corner[1] + (next[1] - corner[1]) * t]);
    }
  });
  const count = points.length;

  return points.map((point, i) => {
    const previous = points[(i - 1 + count) % count] as Point2;
    const next = points[(i + 1) % count] as Point2;
    const tangent: Point2 = [next[0] - previous[0], next[1] - previous[1]];
    const norm = Math.hypot(tangent[0], tangent[1]) || 1;

    return { x: point[0], y: point[1], tx: tangent[0] / norm, ty: tangent[1] / norm };
  });
};

/* How far the shape extends behind the outline at this vertex, measured along the inward normal. */
const depthBehind = (path: paper.Path, vertex: OutlineVertex, reach: number): number => {
  const sides: Point2[] = [
    [-vertex.ty, vertex.tx],
    [vertex.ty, -vertex.tx],
  ];

  for (const [nx, ny] of sides) {
    if (!path.contains(new paper.Point(vertex.x + nx * INSIDE_PROBE, vertex.y + ny * INSIDE_PROBE))) continue;
    const ray = new paper.Path.Line({
      from: [vertex.x + nx * RAY_OFFSET, vertex.y + ny * RAY_OFFSET],
      to: [vertex.x + nx * reach, vertex.y + ny * reach],
      insert: false,
    });
    const hits = path
      .getIntersections(ray)
      .map((hit) => Math.hypot(hit.point.x - vertex.x, hit.point.y - vertex.y))
      .filter((distance) => distance > RAY_OFFSET * 2);

    ray.remove();

    return hits.length > 0 ? Math.min(...hits) : reach;
  }

  return 0;
};

/* Centres of the stroke ends of a ribbon (knife cut faces, tapered or round caps). */
export const strokeEnds = (path: paper.Path): Point2[] => {
  const width = ribbonWidth(path);
  const step = Math.max(MIN_STEP, width * STEP_WIDTHS);
  const vertices = resampleLoop(path, step);
  const count = vertices.length;
  const reach = 2 * Math.hypot(path.bounds.width, path.bounds.height);
  const deep = vertices.map((vertex) => depthBehind(path, vertex, reach) > END_DEPTH_WIDTHS * width);
  const firstShallow = deep.indexOf(false);

  if (firstShallow < 0) return [];
  const at = (index: number): OutlineVertex => vertices[((index % count) + count) % count] as OutlineVertex;
  const ends: Point2[] = [];
  let run: number[] = [];
  const flush = (): void => {
    const middleIndex = run[Math.floor(run.length / 2)];

    if (middleIndex !== undefined) {
      const middle = at(middleIndex);

      ends.push([middle.x, middle.y]);
    }
    run = [];
  };

  // Walk the loop from a shallow vertex so a run never straddles the seam.
  for (let k = 1; k <= count; k++) {
    const index = (firstShallow + k) % count;

    if (deep[index]) run.push(index);
    else flush();
  }
  flush();

  return ends;
};
