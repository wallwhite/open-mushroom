import type { MushroomSlotId } from '../core/constants/mushroom-slots';
import { MUSHROOM_PAINT_STYLES, type MushroomPaint } from './mushroom-paint-styles';

/*
 * One skeleton slot. The element always exists (stable selectors for the rig);
 * a part missing from the current emotion is an empty, transparent path.
 */
export const MushroomSlotPath = ({
  slot,
  d,
  paint,
  id,
}: {
  slot: MushroomSlotId;
  d: string | null;
  paint: MushroomPaint;
  id?: string;
}) => (
  <path
    {...(id ? { id } : {})}
    data-mushroom-slot={slot}
    style={MUSHROOM_PAINT_STYLES[paint]}
    d={d ?? ''}
    opacity={d === null ? 0 : 1}
  />
);
