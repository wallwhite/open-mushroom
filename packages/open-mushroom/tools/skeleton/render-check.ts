import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import sharpImage from 'sharp';

import { MUSHROOM_OPEN_EYE_EMOTIONS, type MushroomEmotion } from '../../src/core/constants/mushroom-emotions';
import { MUSHROOM_EYE_SIDES, MUSHROOM_EYE_SLOTS, type MushroomEyeSide } from '../../src/core/constants/mushroom-slots';

import type { AssembledEmotion } from './assemble-frame';
import { areaOf } from './paper-context';
import {
  CHANNELS,
  contentMask,
  countMask,
  diffMask,
  diffOverlay,
  largestBlob,
  type Raster,
  rasterize,
} from './raster-diff';
import { assemblySvg, originalSvg, slotsSvg } from './render-svg';

/*
 * Pixel gates: the reassembled skeleton must be indistinguishable from the
 * Figma export at rest, and the pupil must really have been lifted out of the
 * ring (an assembly without pupil slots has to lose exactly the pupil ink).
 */
export const RASTER_WIDTH = 768;
const DEBUG_WIDTH = 1200;
const MAX_MISMATCH = 0.005;
const MAX_BLOB_PX = 40;
const PUPIL_AREA_TOLERANCE = 0.2;
const MIN_PUPIL_RATIO = 0.3;

export interface CheckMetrics {
  emotion: MushroomEmotion;
  inkPx: number;
  diffPx: number;
  mismatch: number;
  maxBlobPx: number;
  pupilDiffPx: number;
  pupilInkPx: number;
  pupilRatio: Record<MushroomEyeSide, number | null>;
  failures: string[];
}

type Measured = Omit<CheckMetrics, 'failures'>;

const pupilRatios = (assembled: AssembledEmotion): Record<MushroomEyeSide, number | null> =>
  Object.fromEntries(
    MUSHROOM_EYE_SIDES.map((side) => {
      const circle = assembled.pupils[side];
      const white = assembled.pieces[MUSHROOM_EYE_SLOTS[side].white];

      return [side, circle && white ? circle.r / white.bounds.height : null];
    }),
  ) as Record<MushroomEyeSide, number | null>;

const pupilFailures = (measured: Measured, assembled: AssembledEmotion): string[] => {
  const failures: string[] = [];
  const expectPupils = (MUSHROOM_OPEN_EYE_EMOTIONS as readonly MushroomEmotion[]).includes(assembled.emotion);

  for (const side of MUSHROOM_EYE_SIDES) {
    const ratio = measured.pupilRatio[side];

    if (expectPupils && ratio === null) failures.push(`${side} pupil missing on an open-eye emotion`);
    if (!expectPupils && assembled.pupils[side]) failures.push(`${side} pupil present on a closed-eye emotion`);
    if (ratio !== null && ratio < MIN_PUPIL_RATIO) {
      failures.push(`${side} pupil r/white-height ${ratio.toFixed(2)} below ${MIN_PUPIL_RATIO}`);
    }
  }
  const { pupilDiffPx, pupilInkPx } = measured;

  if (expectPupils && Math.abs(pupilDiffPx - pupilInkPx) > PUPIL_AREA_TOLERANCE * pupilInkPx) {
    failures.push(`assembly without pupils differs by ${pupilDiffPx}px², expected ${pupilInkPx.toFixed(0)}px² ±20%`);
  }
  if (!expectPupils && pupilDiffPx !== 0)
    failures.push(`pupil slots changed a closed-eye emotion by ${pupilDiffPx}px²`);

  return failures;
};

const gateFailures = (measured: Measured, assembled: AssembledEmotion): string[] => {
  const failures: string[] = [];

  if (measured.mismatch > MAX_MISMATCH) {
    failures.push(`mismatch ${(measured.mismatch * 100).toFixed(2)}% exceeds ${MAX_MISMATCH * 100}%`);
  }
  if (measured.maxBlobPx > MAX_BLOB_PX)
    failures.push(`largest diff blob ${measured.maxBlobPx}px² exceeds ${MAX_BLOB_PX}px²`);

  return [...failures, ...pupilFailures(measured, assembled)];
};

const writeDebugRenders = async (
  dir: string,
  assembled: AssembledEmotion,
  original: Raster,
  diff: Uint8Array,
): Promise<void> => {
  await mkdir(dir, { recursive: true });
  const name = (suffix: string): string => path.join(dir, `${assembled.emotion}-${suffix}.png`);

  await sharpImage(Buffer.from(originalSvg(assembled, DEBUG_WIDTH)))
    .png()
    .toFile(name('original'));
  await sharpImage(Buffer.from(assemblySvg(assembled, DEBUG_WIDTH, true)))
    .png()
    .toFile(name('assembly'));
  await sharpImage(Buffer.from(slotsSvg(assembled, DEBUG_WIDTH)))
    .png()
    .toFile(name('slots'));
  await sharpImage(diffOverlay(original, diff), {
    raw: { width: original.width, height: original.height, channels: CHANNELS },
  })
    .png()
    .toFile(name('diff'));
};

export const renderCheck = async (assembled: AssembledEmotion, debugDir: string | null): Promise<CheckMetrics> => {
  const [original, assembly, assemblyWithoutPupils] = await Promise.all([
    rasterize(originalSvg(assembled, RASTER_WIDTH)),
    rasterize(assemblySvg(assembled, RASTER_WIDTH, true)),
    rasterize(assemblySvg(assembled, RASTER_WIDTH, false)),
  ]);
  const inkPx = countMask(contentMask(original));
  const diff = diffMask(original, assembly);
  const diffPx = countMask(diff);
  const scale = RASTER_WIDTH / assembled.width;
  const measured: Measured = {
    emotion: assembled.emotion,
    inkPx,
    diffPx,
    mismatch: inkPx === 0 ? 1 : diffPx / inkPx,
    maxBlobPx: largestBlob(diff, original.width, original.height),
    pupilDiffPx: countMask(diffMask(original, assemblyWithoutPupils)) - diffPx,
    pupilInkPx: MUSHROOM_EYE_SIDES.reduce((sum, side) => {
      const ink = assembled.pieces[MUSHROOM_EYE_SLOTS[side].pupil];

      return sum + (ink ? areaOf(ink) * scale * scale : 0);
    }, 0),
    pupilRatio: pupilRatios(assembled),
  };

  if (debugDir) await writeDebugRenders(debugDir, assembled, original, diff);

  return { ...measured, failures: gateFailures(measured, assembled) };
};
