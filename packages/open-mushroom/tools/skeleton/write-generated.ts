import { writeFile } from 'node:fs/promises';

import { MUSHROOM_EMOTIONS, type MushroomEmotion } from '../../src/core/constants/mushroom-emotions';
import type { MushroomEmotionFrame, MushroomHat, MushroomManifest } from '../../src/core/types/mushroom-manifest.types';

import { mushroomHatSchema, mushroomManifestSchema } from './mushroom-manifest.schema';

/* The hat is a single gradient-filled path; the gradient id is assigned by the component. */
export const parseHat = (svg: string): MushroomHat => {
  const viewBox = (/viewBox="([^"]+)"/.exec(svg)?.[1] ?? '').trim().split(/\s+/).map(Number);
  const d = /<path[^>]*\sd="([^"]+)"/.exec(svg)?.[1];
  const gradientTag = /<linearGradient[^>]*>/.exec(svg)?.[0] ?? '';
  const attr = (name: string): number => Number(new RegExp(`\\s${name}="([^"]+)"`).exec(gradientTag)?.[1]);
  const stops = [...svg.matchAll(/<stop([^>]*)\/>/g)].map((match) => ({
    offset: Number(/offset="([^"]+)"/.exec(match[1] ?? '')?.[1] ?? 0),
    color: /stop-color="([^"]+)"/.exec(match[1] ?? '')?.[1],
  }));

  return mushroomHatSchema.parse({
    viewBox: { width: viewBox[2], height: viewBox[3] },
    d,
    gradient: { x1: attr('x1'), y1: attr('y1'), x2: attr('x2'), y2: attr('y2'), stops },
  });
};

/* zod keeps the schema's key order, which makes the JSON diff-stable across builds. */
export const buildManifest = (
  faceSpace: MushroomManifest['faceSpace'],
  sourceSha256: Record<MushroomEmotion | 'hat', string>,
  frames: Record<MushroomEmotion, MushroomEmotionFrame>,
): MushroomManifest =>
  mushroomManifestSchema.parse({
    faceSpace,
    sourceSha256,
    emotions: Object.fromEntries(MUSHROOM_EMOTIONS.map((emotion) => [emotion, frames[emotion]])),
  });

export const writeJsonFile = (file: string, value: unknown): Promise<void> =>
  writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
