import paper from 'paper-jsdom';
import { beforeAll, describe, expect, it } from 'vitest';

import { normalizePathStart, startPointFor } from './normalize-path-start';
import { setupPaper } from './paper-context';
import { strokeEnds } from './stroke-ends';

const RIBBON_LENGTH = 200;
const RIBBON_WIDTH = 20;
const ANCHORS = 64;

const rect = (x: number, y: number, width: number, height: number): paper.Path =>
  new paper.Path.Rectangle({ point: [x, y], size: [width, height], insert: false });

describe('stroke ends', () => {
  beforeAll(() => {
    setupPaper();
  });

  it('finds the two short sides of a ribbon and no end on a disc', () => {
    const ends = strokeEnds(rect(0, 0, RIBBON_LENGTH, RIBBON_WIDTH));

    expect(ends).toHaveLength(2);
    expect(ends.map(([x]) => Math.round(x)).sort((a, b) => a - b)).toEqual([0, RIBBON_LENGTH]);
    expect(strokeEnds(new paper.Path.Circle({ center: [0, 0], radius: 40, insert: false }))).toHaveLength(0);
  });

  it('reads a bent ribbon from the end its rule names, not from the corner of the bend', () => {
    const bend = rect(0, 0, RIBBON_LENGTH, RIBBON_WIDTH).unite(rect(0, 0, RIBBON_WIDTH, RIBBON_LENGTH), {
      insert: false,
    }) as paper.Path;

    const [, fromTop] = startPointFor(bend, 'top');
    const [fromLeft] = startPointFor(bend, 'left');

    expect(Math.round(fromTop)).toBe(0);
    expect(Math.round(fromLeft)).toBe(0);
  });

  it('reads a vertical stroke from its top and a horizontal one from its left', () => {
    const vertical = startPointFor(rect(100, 0, RIBBON_WIDTH, RIBBON_LENGTH), 'top');
    const horizontal = startPointFor(rect(0, 100, RIBBON_LENGTH, RIBBON_WIDTH), 'left');

    expect(Math.round(vertical[1])).toBe(0);
    expect(Math.round(horizontal[0])).toBe(0);
  });

  it('starts a blob at its top-left extreme', () => {
    const [x, y] = startPointFor(new paper.Path.Circle({ center: [50, 50], radius: 30, insert: false }), 'extreme');

    expect(x + 2 * y).toBeLessThan(50 + 2 * 50);
    expect(y).toBeLessThan(50);
  });
});

describe('normalizePathStart', () => {
  beforeAll(() => {
    setupPaper();
  });

  it('makes the outline clockwise, starts it at the rule point and spaces anchors evenly', () => {
    const ribbon = rect(0, 0, RIBBON_WIDTH, RIBBON_LENGTH);

    ribbon.reverse();
    normalizePathStart(ribbon, 'top', { count: ANCHORS, label: 'test/slot' });

    expect(ribbon.clockwise).toBe(true);
    expect(Math.round(ribbon.firstSegment.point.y)).toBe(0);
    expect(ribbon.segments).toHaveLength(ANCHORS);
  });

  it('keeps the outline identical on a curved shape and snaps an explicit anchor to it', () => {
    const blob = new paper.Path.Ellipse({ center: [100, 100], size: [160, 90], insert: false });
    const before = { length: blob.length, area: Math.abs(blob.area) };

    normalizePathStart(blob, 'extreme', { count: ANCHORS, label: 'test/slot', anchor: [100, 0] });

    expect(blob.length / before.length).toBeCloseTo(1, 2);
    expect(Math.abs(blob.area) / before.area).toBeCloseTo(1, 2);
    expect(blob.segments).toHaveLength(ANCHORS);
    expect(Math.round(blob.firstSegment.point.y)).toBe(55);
    for (const curve of blob.curves) expect(curve.point1.getDistance(curve.point2)).toBeGreaterThan(0.5);
  });

  it('keeps holes wound the other way and orders subpaths largest first', () => {
    const hole = rect(40, 40, 20, 20);
    const outer = rect(0, 0, 100, 100);
    const item = new paper.CompoundPath({ children: [hole, outer], insert: false });

    normalizePathStart(item, 'extreme', { count: ANCHORS, label: 'test/slot' });
    const [first, second] = item.children as paper.Path[];

    expect(Math.abs(first!.area)).toBeGreaterThan(Math.abs(second!.area));
    expect(first!.clockwise).toBe(true);
    expect(second!.clockwise).toBe(false);
  });
});
