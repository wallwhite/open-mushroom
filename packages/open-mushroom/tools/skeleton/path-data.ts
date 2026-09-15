import type paper from 'paper-jsdom';

import { childrenOf, type PathItem } from './paper-context';

/*
 * Serialises a subpath as one absolute move plus relative curves, one decimal.
 *
 * Rounding each delta on its own lets the error accumulate along the subpath —
 * a random walk that misses the start by over a unit on a long outline. That
 * matters because MorphSVG's parser adds an extra closing anchor when the walk
 * misses by more than half a unit, which would give one slot different anchor
 * counts in different emotions and put the index pairing back out of step. So
 * every delta is measured from the position already written rather than from
 * the true one: the error stays inside one rounding step and the walk closes.
 */
const CLOSING_TOLERANCE = 0.5;

const subpathData = (path: paper.Path, precision: number): string => {
  const step = 10 ** precision;
  const round = (value: number): number => Math.round(value * step) / step;
  const pair = (x: number, y: number): string => `${round(x)},${round(y)}`;
  /* Where the walk has actually reached, after rounding. */
  let atX = round(path.firstSegment.point.x);
  let atY = round(path.firstSegment.point.y);
  const parts = [`M${pair(atX, atY)}c`];

  for (const curve of path.curves) {
    const { segment1: from, segment2: to } = curve;
    const triple = [
      pair(from.point.x + from.handleOut.x - atX, from.point.y + from.handleOut.y - atY),
      pair(to.point.x + to.handleIn.x - atX, to.point.y + to.handleIn.y - atY),
      pair(to.point.x - atX, to.point.y - atY),
    ];

    atX += round(to.point.x - atX);
    atY += round(to.point.y - atY);
    parts.push(triple.join(' '));
  }

  return `${parts.join(' ')}z`;
};

export const pathDataOf = (item: PathItem, precision = 1): string =>
  childrenOf(item)
    .map((child) => subpathData(child, precision))
    .join('');

/* How far a subpath's rounded walk lands from where it started; MorphSVG adds an anchor past half a unit. */
export const closingGap = (pathData: string): number =>
  Math.max(
    ...pathData.split(/(?=M)/).map((part) => {
      const numbers = part
        .replaceAll(/[Mcz]/g, ' ')
        .trim()
        .split(/[\s,]+/)
        .map(Number);
      const start = [numbers[0] ?? 0, numbers[1] ?? 0] as const;
      let [x, y] = start;

      for (let i = 2; i + 5 < numbers.length; i += 6) {
        x += numbers[i + 4] ?? 0;
        y += numbers[i + 5] ?? 0;
      }

      return Math.max(Math.abs(x - start[0]), Math.abs(y - start[1]));
    }),
  );

export const assertClosingGap = (pathData: string, label: string): void => {
  const gap = closingGap(pathData);

  if (gap > CLOSING_TOLERANCE) throw new Error(`${label}: rounded path misses its start by ${gap.toFixed(2)} units`);
};
