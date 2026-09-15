import { FACE_LAYOUT, layoutTransform } from '../core/constants/mushroom-layout';
import {
  MUSHROOM_EXTRA_SLOTS,
  MUSHROOM_EYE_SIDES,
  MUSHROOM_INK_PAINT_ORDER,
  MUSHROOM_WHITE_SLOTS,
  type MushroomSlotId,
} from '../core/constants/mushroom-slots';
import type { MushroomEmotionFrame } from '../core/types/mushroom-manifest.types';
import { MushroomEye } from './mushroom-eye';
import type { MushroomIds } from './mushroom-ids';
import type { MushroomPaint } from './mushroom-paint-styles';
import { MushroomSlotPath } from './mushroom-slot-path';

const EYE_RING_SIDE: Partial<Record<MushroomSlotId, 'left' | 'right'>> = {
  'eye-left-ring': 'left',
  'eye-right-ring': 'right',
};

const paintFor = (slot: MushroomSlotId): MushroomPaint =>
  (MUSHROOM_WHITE_SLOTS as readonly MushroomSlotId[]).includes(slot) ? 'white' : 'ink';

/*
 * Top layer. Rendered once from the initial emotion: after mount GSAP owns
 * every `d`, and React never writes them again (the frame prop is constant).
 */
export const MushroomFace = ({ ids, frame }: { ids: MushroomIds; frame: MushroomEmotionFrame }) => (
  <>
    <defs>
      {MUSHROOM_EYE_SIDES.map((side) => (
        <clipPath key={side} id={ids.clip(side)}>
          <use href={`#${ids.white(side)}`} />
        </clipPath>
      ))}
    </defs>
    <g data-mushroom-layer="face" transform={layoutTransform(FACE_LAYOUT)}>
      {/* Outer animated group breathes; the inner one belongs to the emotion scenario, so transforms never collide. */}
      <g data-mushroom-anim="face">
        <g data-mushroom-anim="face-scenario">
          {MUSHROOM_INK_PAINT_ORDER.map((slot) => {
            const side = EYE_RING_SIDE[slot];

            return side ? (
              <MushroomEye key={slot} side={side} ids={ids} frame={frame} />
            ) : (
              <MushroomSlotPath key={slot} slot={slot} d={frame.slots[slot]} paint={paintFor(slot)} />
            );
          })}
          {MUSHROOM_EXTRA_SLOTS.map((slot) => (
            <MushroomSlotPath key={slot} slot={slot} d={frame.slots[slot]} paint={paintFor(slot)} />
          ))}
        </g>
      </g>
    </g>
  </>
);
