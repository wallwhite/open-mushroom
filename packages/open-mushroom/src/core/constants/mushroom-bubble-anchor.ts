import { MUSHROOM_BUBBLE_TAIL_REACH_PX } from './mushroom-bubble-tail';
import { BODY_CORE, MUSHROOM_VIEWBOX } from './mushroom-layout';

/*
 * Where a speech bubble hangs next to the character, as offsets from the right
 * and bottom edges of the mushroom's box (CSS `right` / `bottom` inside a
 * `position: relative` wrapper around <Mushroom>). The card's bottom-right
 * corner, where the tail grows, sits left of the body and a little above its
 * centre, so the tail reaches across the gap to the face without covering it.
 * The offsets scale with the box (they derive from the body's core ellipse);
 * the tail does not, so `right` also carries its reach in pixels — otherwise a
 * small character would wear the tail on its face.
 */

/* Gap between the tail's tip and the body's edge, as a share of the box. */
const GAP = 0.08;
/* How far above the body's centre the card's bottom edge sits, as a share of the body's height. */
const LIFT = 0.12;
const DIAMETER = 2;
const PERCENT = 100;

const percent = (share: number): string => `${(share * PERCENT).toFixed(1)}%`;

/* Plain strings on purpose: the published type must not change with the formula. */
export const MUSHROOM_BUBBLE_ANCHOR: { readonly right: string; readonly bottom: string } = {
  right: `calc(${percent(1 - (BODY_CORE.cx - BODY_CORE.rx) / MUSHROOM_VIEWBOX + GAP)} + ${MUSHROOM_BUBBLE_TAIL_REACH_PX}px)`,
  bottom: percent(1 - BODY_CORE.cy / MUSHROOM_VIEWBOX + (LIFT * DIAMETER * BODY_CORE.ry) / MUSHROOM_VIEWBOX),
};
