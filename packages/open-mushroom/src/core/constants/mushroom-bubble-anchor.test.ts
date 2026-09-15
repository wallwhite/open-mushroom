import { describe, expect, it } from 'vitest';

import { MUSHROOM_BUBBLE_ANCHOR } from './mushroom-bubble-anchor';
import { MUSHROOM_BUBBLE_TAIL_REACH_PX } from './mushroom-bubble-tail';
import { BODY_CORE, MUSHROOM_VIEWBOX } from './mushroom-layout';

const PERCENT = 100;
const SIZES = [40, 56, 64, 96, 160, 240, 400];
const MIN_GAP_SHARE = 0.05;

/* `calc(<share>% + <px>px)` → the two terms; a bare percentage has no pixel term. */
const parse = (value: string): { share: number; px: number } => {
  const match = /^(?:calc\(([\d.]+)% \+ (\d+)px\)|([\d.]+)%)$/.exec(value);

  if (!match) throw new Error(`unexpected offset: ${value}`);

  return { share: Number(match[1] ?? match[3]) / PERCENT, px: Number(match[2] ?? 0) };
};

describe('MUSHROOM_BUBBLE_ANCHOR', () => {
  const bodyLeft = (BODY_CORE.cx - BODY_CORE.rx) / MUSHROOM_VIEWBOX;
  const bodyCentre = BODY_CORE.cy / MUSHROOM_VIEWBOX;
  const bodyHeight = (2 * BODY_CORE.ry) / MUSHROOM_VIEWBOX;

  it.each(SIZES)('keeps the tail tip left of the body with a gap at %d px', (size) => {
    const right = parse(MUSHROOM_BUBBLE_ANCHOR.right);
    const cardRightEdge = size - (right.share * size + right.px);
    const tailTip = cardRightEdge + MUSHROOM_BUBBLE_TAIL_REACH_PX;

    /* The gap between the tail's tip and the body scales with the box. */
    expect(bodyLeft * size - tailTip).toBeGreaterThanOrEqual(MIN_GAP_SHARE * size);
  });

  it("puts the card's bottom edge a little above the body's centre, never above the body", () => {
    const cardBottomEdge = 1 - parse(MUSHROOM_BUBBLE_ANCHOR.bottom).share;

    expect(cardBottomEdge).toBeLessThan(bodyCentre);
    expect(cardBottomEdge).toBeGreaterThan(bodyCentre - bodyHeight / 4);
  });

  it('carries the tail reach as a pixel term, so the gap survives small sizes', () => {
    expect(parse(MUSHROOM_BUBBLE_ANCHOR.right).px).toBe(MUSHROOM_BUBBLE_TAIL_REACH_PX);
    expect(MUSHROOM_BUBBLE_TAIL_REACH_PX).toBeGreaterThan(0);
  });
});
