import { MUSHROOM_EYE_SLOTS, type MushroomEyeSide } from '../core/constants/mushroom-slots';
import type { MushroomEmotionFrame } from '../core/types/mushroom-manifest.types';
import type { MushroomIds } from './mushroom-ids';
import { MushroomSlotPath } from './mushroom-slot-path';

/*
 * Ring, white and pupil of one eye. The export paints the white over the ring
 * and the pupil over the white; the pupil sits in a still wrapper that carries
 * the clip (a <use> of the white, so one morph moves white and clip alike),
 * and gaze moves the inner group only. Blink scales the eye group.
 */
export const MushroomEye = ({
  side,
  ids,
  frame,
}: {
  side: MushroomEyeSide;
  ids: MushroomIds;
  frame: MushroomEmotionFrame;
}) => {
  const { ring, white, pupil } = MUSHROOM_EYE_SLOTS[side];

  return (
    <g data-mushroom-eye={side}>
      <MushroomSlotPath slot={ring} d={frame.slots[ring]} paint="ink" />
      <MushroomSlotPath id={ids.white(side)} slot={white} d={frame.slots[white]} paint="white" />
      <g clipPath={`url(#${ids.clip(side)})`}>
        <g data-mushroom-pupil={side}>
          <MushroomSlotPath slot={pupil} d={frame.slots[pupil]} paint="ink" />
        </g>
      </g>
    </g>
  );
};
