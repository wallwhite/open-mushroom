import type { MushroomEmotion } from './mushroom-emotions';
import type { BodyLayerKey } from './mushroom-layout';

export type MushroomPalette = Record<BodyLayerKey, string>;

/* Body colours per emotion; the default is the soft brand green, moods shift the hue. */
export const MUSHROOM_PALETTES: Record<MushroomEmotion, MushroomPalette> = {
  neutral: { halo: '#8fd07a', tint: '#d6f0b8', core: '#b9e59a' },
  staring: { halo: '#7fcf9a', tint: '#cbeedc', core: '#b3e3b0' },
  thinking: { halo: '#7ccbb5', tint: '#d5efe3', core: '#b7e0c9' },
  sleep: { halo: '#9fb6df', tint: '#d8e2f4', core: '#bcd0e8' },
  excited: { halo: '#a9dd5e', tint: '#eef7bd', core: '#d8ec8e' },
  angry: { halo: '#e8896f', tint: '#f7d3c6', core: '#f0b6a1' },
  drunk: { halo: '#d68fcf', tint: '#f3dcf0', core: '#e6bde0' },
};
