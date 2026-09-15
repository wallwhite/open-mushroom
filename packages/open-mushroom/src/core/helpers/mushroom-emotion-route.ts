import { MUSHROOM_EMOTION_APPROACH, type MushroomEmotion } from '../constants/mushroom-emotions';

/*
 * The next face to actually show on the way from one emotion to another: the
 * target itself, or the waypoint its approach asks for. The runtime asks again
 * after every leg, so a route is walked one hop at a time and a target that
 * changes mid-route simply re-routes from the face on screen. A waypoint is
 * skipped when it is where we already are or where we are going, which is what
 * keeps the walk finite.
 */
export const nextEmotionHop = (from: MushroomEmotion, to: MushroomEmotion): MushroomEmotion => {
  if (from === to) return to;
  const via = MUSHROOM_EMOTION_APPROACH[to] ?? MUSHROOM_EMOTION_APPROACH[from];

  return via && via !== from && via !== to ? via : to;
};
