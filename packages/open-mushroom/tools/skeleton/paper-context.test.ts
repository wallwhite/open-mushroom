import paper from 'paper-jsdom';
import { beforeAll, describe, expect, it } from 'vitest';

import { cutWithKnife, dropSlivers, isSliver, setupPaper, unite } from './paper-context';

const SQUARE = 100;
const OVERLAP = 1.5;

const rect = (x: number, y: number, width: number, height: number): paper.Path =>
  new paper.Path.Rectangle({ point: [x, y], size: [width, height], insert: false });

const compound = (...children: paper.Path[]): paper.CompoundPath => new paper.CompoundPath({ children, insert: false });

describe('dropSlivers', () => {
  beforeAll(() => {
    setupPaper();
  });

  it('returns a real plain path untouched and rejects a lone hairline', () => {
    const part = rect(0, 0, 200, 200);

    expect(dropSlivers(part)).toBe(part);
    expect(dropSlivers(rect(0, 0, 100, 2))).toBeNull();
    expect(dropSlivers(null)).toBeNull();
  });

  it('drops a hairline next to a part and un-nests the survivor', () => {
    const result = dropSlivers(compound(rect(0, 0, 200, 200), rect(300, 0, 100, 2)));

    expect(result).toBeInstanceOf(paper.Path);
    expect(Math.abs((result as paper.Path).area)).toBeCloseTo(40_000, 0);
  });

  it('keeps a small but solid corner piece (no ratio rule)', () => {
    const result = dropSlivers(compound(rect(0, 0, 200, 200), rect(300, 0, 22, 25)));

    expect(result).toBeInstanceOf(paper.CompoundPath);
    expect((result as paper.CompoundPath).children).toHaveLength(2);
  });

  it('drops a crumb under the area floor', () => {
    const result = dropSlivers(compound(rect(0, 0, 200, 200), rect(300, 0, 7, 7)));

    expect(result).toBeInstanceOf(paper.Path);
  });

  it('recognises a diagonal hairline whose bounding box is large', () => {
    const diagonal = rect(300, 0, 141, 2);

    diagonal.rotate(45);

    expect(diagonal.bounds.width).toBeGreaterThan(90);
    expect(isSliver(diagonal)).toBe(true);
    expect(dropSlivers(compound(rect(0, 0, 200, 200), diagonal))).toBeInstanceOf(paper.Path);
  });

  it('returns null when the largest piece is itself debris', () => {
    expect(dropSlivers(compound(rect(0, 0, 100, 3), rect(200, 0, 50, 2)))).toBeNull();
  });
});

describe('cutWithKnife', () => {
  beforeAll(() => {
    setupPaper();
  });

  it('lets two abutting knives feed one slot as a single seamless path', () => {
    const square = rect(0, 0, SQUARE, SQUARE);
    const left = cutWithKnife(square, { kind: 'rect', x1: 0, y1: 0, x2: SQUARE / 2, y2: SQUARE }, OVERLAP);

    expect(left.inside).not.toBeNull();
    expect(left.outside).not.toBeNull();
    const right = cutWithKnife(
      left.outside as paper.PathItem,
      { kind: 'rect', x1: SQUARE / 2, y1: 0, x2: SQUARE, y2: SQUARE },
      OVERLAP,
    );

    expect(right.outside).toBeNull();
    const slot = unite(left.inside as paper.PathItem, right.inside as paper.PathItem);

    expect(slot).toBeInstanceOf(paper.Path);
    expect(Math.abs((slot as paper.Path).area)).toBeCloseTo(SQUARE * SQUARE, 0);
  });
});
