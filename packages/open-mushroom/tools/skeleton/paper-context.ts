import paper from 'paper-jsdom';

import { type Knife, knifePolygon, type Point2 } from './knife-geometry';

/*
 * Thin wrapper over paper.js (headless via paper-jsdom). Every boolean result is
 * created with `insert: false` and passed through `cleanup`, which drops the
 * hairline slivers boolean operations leave behind on outline-stroked shapes.
 */
export type PathItem = paper.PathItem;

export interface SourcePath {
  index: number;
  item: PathItem;
  d: string;
  fill: string;
}

export interface SourceSvg {
  width: number;
  height: number;
  paths: SourcePath[];
}

const BOOLEAN_OPTIONS = { insert: false };
/* Boolean leftovers below this area (source units²) are numerical noise. */
const NOISE_AREA = 3;
/*
 * A knife piece is a sliver (not a part) when it is thinner than a hairline or a
 * crumb. Thickness is measured as 2·area/perimeter, so a diagonal hairline along
 * a rotated strip knife counts as thin even though its bounding box is large.
 */
const SLIVER_MIN_DIMENSION = 6;
const SLIVER_MAX_AREA = 60;
const CANVAS_SIZE = 64;

let ready = false;

export const setupPaper = (): typeof paper => {
  if (!ready) {
    paper.setup(new paper.Size(CANVAS_SIZE, CANVAS_SIZE));
    ready = true;
  }

  return paper;
};

export const areaOf = (item: PathItem): number => Math.abs((item as paper.Path | paper.CompoundPath).area);

export const childrenOf = (item: PathItem): paper.Path[] =>
  item instanceof paper.CompoundPath ? (item.children as paper.Path[]) : [item as paper.Path];

/* Figma exports whites as `white` and once as `#FCFCFD`. */
export const isWhiteFill = (fill: string): boolean => /^(white|#f[\da-f]{5}|#fff)$/i.test(fill.trim());

export const loadSourceSvg = (svg: string): SourceSvg => {
  setupPaper();
  const viewBox = (/viewBox="([^"]+)"/.exec(svg)?.[1] ?? '').trim().split(/\s+/).map(Number);
  const attrs = [...svg.matchAll(/<path\b([^>]*)\/?>/g)].map((match) => match[1] ?? '');
  const imported = paper.project.importSVG(svg, { insert: false, expandShapes: true });
  const children = imported instanceof paper.Group ? imported.children : [imported];
  // importSVG prepends the <svg> viewport as a Shape; only real path items map to <path> elements.
  const items = children.filter((child): child is PathItem => child instanceof paper.PathItem);

  if (items.length !== attrs.length) {
    throw new Error(`importSVG produced ${items.length} path items for ${attrs.length} <path> elements`);
  }

  return {
    width: viewBox[2] ?? 0,
    height: viewBox[3] ?? 0,
    paths: items.map((item, index) => ({
      index,
      item,
      d: /\sd="([^"]+)"/.exec(attrs[index] ?? '')?.[1] ?? '',
      fill: /\sfill="([^"]+)"/.exec(attrs[index] ?? '')?.[1] ?? 'none',
    })),
  };
};

export const cleanup = (item: PathItem | null | undefined): PathItem | null => {
  if (!item) return null;
  if (!(item instanceof paper.CompoundPath)) return areaOf(item) >= NOISE_AREA ? item : null;
  const children = [...childrenOf(item)];
  const kept = children.filter((child) => Math.abs(child.area) >= NOISE_AREA);

  if (kept.length === 0) return null;
  for (const child of children) if (!kept.includes(child)) child.remove();
  if (kept.length === 1) {
    const only = kept[0] as paper.Path;

    only.remove();

    return only;
  }

  return item;
};

export const isSliver = (path: paper.Path): boolean => {
  const area = Math.abs(path.area);
  const thickness = path.length > 0 ? (2 * area) / path.length : 0;
  const thin = Math.min(path.bounds.width, path.bounds.height, thickness) < SLIVER_MIN_DIMENSION;

  return thin || area < SLIVER_MAX_AREA;
};

/*
 * Drops sub-paths that can only be knife debris: hairlines along a cut or crumbs
 * next to a real part. Null when nothing but debris is left, so a knife that
 * caught only a seam fails the build instead of shipping a hairline slot.
 */
export const dropSlivers = (item: PathItem | null): PathItem | null => {
  if (!item) return null;
  if (!(item instanceof paper.CompoundPath)) return isSliver(item as paper.Path) ? null : item;
  const children = [...childrenOf(item)];
  const largest = Math.max(...children.map((child) => Math.abs(child.area)));
  const keeper = children.find((child) => Math.abs(child.area) === largest);

  if (!keeper || isSliver(keeper)) return null;
  for (const child of children) if (child !== keeper && isSliver(child)) child.remove();

  return cleanup(item);
};

export const intersect = (a: PathItem, b: PathItem): PathItem | null => cleanup(a.intersect(b, BOOLEAN_OPTIONS));
export const subtract = (a: PathItem, b: PathItem): PathItem | null => cleanup(a.subtract(b, BOOLEAN_OPTIONS));
export const unite = (a: PathItem, b: PathItem): PathItem | null => cleanup(a.unite(b, BOOLEAN_OPTIONS));

export const uniteAll = (items: PathItem[]): PathItem => {
  const [first, ...rest] = items;

  if (!first) throw new Error('uniteAll: nothing to unite');

  return rest.reduce<PathItem>((acc, item) => unite(acc, item) ?? acc, first);
};

export const clonePath = (item: PathItem): PathItem => item.clone({ insert: false });

export const knifePath = (knife: Knife, expand = 0): paper.Path =>
  new paper.Path({
    segments: knifePolygon(knife, expand).map(([x, y]) => new paper.Point(x, y)),
    closed: true,
    insert: false,
  });

/*
 * `inside` is cut with the knife grown by `overlap`, `outside` with the exact
 * knife, so the two pieces overlap by `overlap` units and no anti-aliasing seam
 * shows where they meet.
 */
export const cutWithKnife = (
  shape: PathItem,
  knife: Knife,
  overlap: number,
): { inside: PathItem | null; outside: PathItem | null } => ({
  inside: intersect(shape, knifePath(knife, overlap)),
  outside: subtract(shape, knifePath(knife)),
});

/* Drops sub-paths that sit inside a larger sub-path (holes the eye whites cover anyway). */
export const fillHoles = (item: PathItem): PathItem => {
  if (!(item instanceof paper.CompoundPath)) return item;
  const children = [...childrenOf(item)];

  for (const child of children) {
    const isHole = children.some(
      (other) =>
        other !== child && Math.abs(other.area) > Math.abs(child.area) && other.contains(child.firstSegment.point),
    );

    if (isHole) child.remove();
  }

  return cleanup(item) ?? item;
};

export const flattenPoints = (item: PathItem, flatness: number): Point2[] => {
  const copy = clonePath(item);

  copy.flatten(flatness);
  const points = childrenOf(copy).flatMap((path) =>
    path.segments.map((segment): Point2 => [segment.point.x, segment.point.y]),
  );

  copy.remove();

  return points;
};

export const distanceToBoundary = (item: PathItem, [x, y]: Point2): number => {
  const point = new paper.Point(x, y);

  return item.getNearestPoint(point).getDistance(point);
};
