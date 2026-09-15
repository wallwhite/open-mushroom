/*
 * Conservative bounding box of SVG path data (control points included), for
 * code that has no DOM to call getBBox on — the manifest invariants test and
 * the lab's registration panel, which works on raw manifest strings.
 * Supports M/L/H/V/C/S/Q/T/Z in both cases; the skeleton never emits arcs.
 */
export interface PathBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

interface Cursor {
  x: number;
  y: number;
  startX: number;
  startY: number;
}

type Step = [PathBounds, Cursor];

const TOKEN = /[CHLMQSTVZchlmqstvz]|-?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/g;
const ARITY: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, Z: 0 };
const PAIR = 2;
/* After a moveto, further coordinate pairs are implicit linetos. */
const IMPLICIT_AFTER_MOVE: Record<string, string> = { M: 'L', m: 'l' };
const EMPTY_BOUNDS: PathBounds = {
  minX: Number.POSITIVE_INFINITY,
  minY: Number.POSITIVE_INFINITY,
  maxX: Number.NEGATIVE_INFINITY,
  maxY: Number.NEGATIVE_INFINITY,
};

const isCommand = (token: string): boolean => /^[A-Za-z]$/.test(token);

const include = (bounds: PathBounds, x: number, y: number): PathBounds => ({
  minX: Math.min(bounds.minX, x),
  minY: Math.min(bounds.minY, y),
  maxX: Math.max(bounds.maxX, x),
  maxY: Math.max(bounds.maxY, y),
});

/* Applies one command; returns the bounds grown by every point it touched and the new cursor. */
const applyCommand = (bounds: PathBounds, cursor: Cursor, command: string, args: number[]): Step => {
  const { x: baseX, y: baseY, startX, startY } = cursor;
  const upper = command.toUpperCase();
  const relative = command !== upper;
  const absolute = (value: number, base: number): number => (relative ? base + value : value);

  if (upper === 'Z') return [bounds, { ...cursor, x: startX, y: startY }];
  if (upper === 'H') {
    const x = absolute(args[0] ?? 0, baseX);

    return [include(bounds, x, baseY), { ...cursor, x }];
  }
  if (upper === 'V') {
    const y = absolute(args[0] ?? 0, baseY);

    return [include(bounds, baseX, y), { ...cursor, y }];
  }
  let grown = bounds;
  let x = baseX;
  let y = baseY;

  for (let i = 0; i < args.length; i += PAIR) {
    x = absolute(args[i] ?? 0, baseX);
    y = absolute(args[i + 1] ?? 0, baseY);
    grown = include(grown, x, y);
  }
  const start = upper === 'M' ? { startX: x, startY: y } : { startX, startY };

  return [grown, { x, y, ...start }];
};

export const pathDataBounds = (d: string): PathBounds => {
  const tokens = d.match(TOKEN) ?? [];
  let bounds = EMPTY_BOUNDS;
  let cursor: Cursor = { x: 0, y: 0, startX: 0, startY: 0 };
  let command = 'M';
  let index = 0;

  while (index < tokens.length) {
    const token = tokens[index] ?? '';
    const explicit = isCommand(token);

    if (explicit) {
      command = token;
      index += 1;
    }
    const arity = ARITY[command.toUpperCase()] ?? 0;

    // A bare number after Z (or an unknown letter) is malformed data: stop instead of looping.
    if (arity === 0 && !explicit) break;
    const args = tokens.slice(index, index + arity).map(Number);

    if (args.length < arity || args.some((value) => Number.isNaN(value))) break;
    index += arity;
    [bounds, cursor] = applyCommand(bounds, cursor, command, args);
    command = IMPLICIT_AFTER_MOVE[command] ?? command;
  }

  return bounds;
};
