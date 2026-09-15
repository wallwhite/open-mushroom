import { describe, expect, it } from 'vitest';

import { MUSHROOM_EMOTIONS, type MushroomEmotion } from '../constants/mushroom-emotions';
import { nextEmotionHop } from './mushroom-emotion-route';

/* Walks the route the way the runtime does, one hop per finished leg. */
const routeOf = (from: MushroomEmotion, to: MushroomEmotion): MushroomEmotion[] => {
  const path: MushroomEmotion[] = [];
  let at = from;

  while (at !== to && path.length <= MUSHROOM_EMOTIONS.length) {
    at = nextEmotionHop(at, to);
    path.push(at);
  }

  return path;
};

describe('nextEmotionHop', () => {
  it('enters and leaves thinking through staring', () => {
    expect(routeOf('neutral', 'thinking')).toEqual(['staring', 'thinking']);
    expect(routeOf('thinking', 'neutral')).toEqual(['staring', 'neutral']);
    expect(routeOf('drunk', 'thinking')).toEqual(['staring', 'thinking']);
  });

  it('goes straight when the waypoint is one of the two ends', () => {
    expect(routeOf('staring', 'thinking')).toEqual(['thinking']);
    expect(routeOf('thinking', 'staring')).toEqual(['staring']);
  });

  it('leaves every other pair alone', () => {
    expect(routeOf('neutral', 'angry')).toEqual(['angry']);
    expect(routeOf('sleep', 'excited')).toEqual(['excited']);
  });

  it('reaches every emotion from every other one', () => {
    for (const from of MUSHROOM_EMOTIONS) {
      for (const to of MUSHROOM_EMOTIONS) {
        if (from === to) continue;
        const route = routeOf(from, to);

        expect(route.at(-1)).toBe(to);
        expect(route.length).toBeLessThanOrEqual(2);
      }
    }
  });

  it('stays put when there is nowhere to go', () => {
    expect(nextEmotionHop('thinking', 'thinking')).toBe('thinking');
  });
});
