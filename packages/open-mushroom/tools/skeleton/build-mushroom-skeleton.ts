/*
 * Builds the mushroom face skeleton from the Figma emotion exports: cuts the fused
 * outlines into slots, lifts the pupils out of the rings, registers `thinking`
 * into the shared face space, verifies the reassembly pixel-by-pixel against
 * the originals and writes the zod-validated JSON manifests.
 *
 * Usage: pnpm mushroom:build [--debug] [--report <file.md>]
 *   --debug   writes original/assembly/diff/slots PNGs to .mushroom-debug/
 *   --report  writes the gate table as markdown
 * Exits 1 when any gate fails (generated files are left untouched).
 */
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { MUSHROOM_EMOTIONS, type MushroomEmotion } from '../../src/core/constants/mushroom-emotions';
import type { MushroomEmotionFrame } from '../../src/core/types/mushroom-manifest.types';

import { anchorBudget } from './anchor-budget';
import { assembleEmotion } from './assemble-frame';
import { MUSHROOM_CUT_PLAN } from './cut-plan';
import { toEmotionFrame } from './emotion-frame';
import { type CheckMetrics, RASTER_WIDTH, renderCheck } from './render-check';
import { startAnchors } from './start-anchors';
import { buildManifest, parseHat, writeJsonFile } from './write-generated';

const SOURCE_DIR = path.join(import.meta.dirname, '../../assets/source');
const OUT_DIR = path.join(import.meta.dirname, '../../src/core/generated');
const DEBUG_DIR = path.join(import.meta.dirname, '../../.mushroom-debug');
const FACE_SPACE = { width: 1536, height: 1024 };

const args = process.argv.slice(2);
const debug = args.includes('--debug');
const reportIndex = args.indexOf('--report');
const reportFile = reportIndex >= 0 ? (args[reportIndex + 1] ?? null) : null;

const sha256 = (buffer: Buffer): string => createHash('sha256').update(buffer).digest('hex');
const pct = (value: number): string => `${(value * 100).toFixed(2)}%`;
const ratio = (value: number | null): string => (value === null ? '—' : value.toFixed(2));
const point = ({ x, y }: { x: number; y: number }): string => `(${x}, ${y})`;

const resultCell = (row: CheckMetrics): string =>
  row.failures.length === 0 ? 'pass' : `FAIL: ${row.failures.join('; ')}`;

const reportMarkdown = (rows: CheckMetrics[], jsonBytes: number): string => {
  const lines = [
    '# Mushroom skeleton — pixel gates',
    '',
    `Raster width ${RASTER_WIDTH}px. Gates: mismatch ≤ 0.5%, largest diff blob ≤ 40px², pupil-less assembly loses pupil ink ±20%, pupil r ≥ 0.3·white height.`,
    '',
    '| Emotion | Mismatch | Max blob px² | Pupil diff px² | Pupil ink px² | r/white L | r/white R | Result |',
    '|---|---|---|---|---|---|---|---|',
    ...rows.map(
      (row) =>
        `| ${row.emotion} | ${pct(row.mismatch)} | ${row.maxBlobPx} | ${row.pupilDiffPx} | ${row.pupilInkPx.toFixed(0)} | ` +
        `${ratio(row.pupilRatio.left)} | ${ratio(row.pupilRatio.right)} | ${resultCell(row)} |`,
    ),
    '',
    `Manifest size: ${(jsonBytes / 1024).toFixed(1)} KB (pretty-printed).`,
    '',
  ];

  return lines.join('\n');
};

interface EmotionBuild {
  emotion: MushroomEmotion;
  hash: string;
  assembled: ReturnType<typeof assembleEmotion>;
  metrics: CheckMetrics;
}

const buildEmotion = async (emotion: MushroomEmotion): Promise<EmotionBuild> => {
  const buffer = await readFile(path.join(SOURCE_DIR, `${emotion}.svg`));
  const assembled = assembleEmotion(emotion, MUSHROOM_CUT_PLAN[emotion], buffer.toString('utf8'));
  const metrics = await renderCheck(assembled, debug ? DEBUG_DIR : null);

  return { emotion, hash: sha256(buffer), assembled, metrics };
};

const printSummary = ({ emotion, metrics }: EmotionBuild, frame: MushroomEmotionFrame): void => {
  const status = metrics.failures.length === 0 ? 'ok' : 'FAIL';

  console.log(
    `${emotion.padEnd(9)} mismatch ${pct(metrics.mismatch).padStart(6)}  blob ${String(metrics.maxBlobPx).padStart(4)}px²  ` +
      `pupils L ${ratio(metrics.pupilRatio.left)} R ${ratio(metrics.pupilRatio.right)}  ${status}`,
  );
  console.log(
    `          anchors eyeL ${point(frame.anchors.eyeLeft)} eyeR ${point(frame.anchors.eyeRight)} mouth ${point(frame.anchors.mouth)}`,
  );
  for (const failure of metrics.failures) console.log(`          ✗ ${failure}`);
};

const run = async (): Promise<void> => {
  // Emotions are independent: assemble and rasterise them concurrently, register (mutating) only after every check ran.
  const builds = await Promise.all(MUSHROOM_EMOTIONS.map((emotion) => buildEmotion(emotion)));
  const frames = {} as Record<MushroomEmotion, MushroomEmotionFrame>;
  const hashes = {} as Record<MushroomEmotion | 'hat', string>;

  // One anchor count per slot for every emotion, so MorphSVG never has to insert points.
  const anchorCounts = anchorBudget(builds.map((build) => build.assembled));
  const draft = {} as Record<MushroomEmotion, MushroomEmotionFrame>;

  for (const build of builds) {
    draft[build.emotion] = toEmotionFrame(build.assembled, anchorCounts, MUSHROOM_CUT_PLAN[build.emotion].registration);
  }
  /*
   * The draft pass reads every slot by its own rule; the emotions then vote on
   * which corner of the slot each start belongs in, and the pieces are cut again
   * and read from there. Without the vote a stroke read from its far end in one
   * emotion maps its two sides onto each other and twists during the morph.
   */
  const references = startAnchors(draft);
  const aligned = await Promise.all(MUSHROOM_EMOTIONS.map((emotion) => buildEmotion(emotion)));

  for (const [index, build] of aligned.entries()) {
    hashes[build.emotion] = build.hash;
    frames[build.emotion] = toEmotionFrame(
      build.assembled,
      anchorCounts,
      MUSHROOM_CUT_PLAN[build.emotion].registration,
      references,
    );
    printSummary(builds[index] as EmotionBuild, frames[build.emotion]);
  }
  /*
   * The first pass rasterised the pieces as the knives left them. Registering and
   * resampling happen afterwards and change the geometry, so the emotions that
   * stay in source coordinates are rasterised again — this time it is the shipped
   * outlines that are compared against the Figma export.
   */
  const registered = new Set(MUSHROOM_EMOTIONS.filter((emotion) => MUSHROOM_CUT_PLAN[emotion].registration));
  const resampled = await Promise.all(
    aligned
      .filter((build) => !registered.has(build.emotion))
      .map(async (build) => ({ emotion: build.emotion, metrics: await renderCheck(build.assembled, null) })),
  );

  for (const { emotion, metrics: row } of resampled) {
    const verdict = row.failures.length === 0 ? 'ok' : `FAIL: ${row.failures.join('; ')}`;

    console.log(
      `${emotion.padEnd(9)} resampled  mismatch ${pct(row.mismatch).padStart(6)}  ` +
        `blob ${String(row.maxBlobPx).padStart(4)}px²  ${verdict}`,
    );
  }

  const hatBuffer = await readFile(path.join(SOURCE_DIR, 'hat.svg'));

  hashes.hat = sha256(hatBuffer);
  const manifest = buildManifest(FACE_SPACE, hashes, frames);
  const hat = parseHat(hatBuffer.toString('utf8'));
  const jsonBytes = JSON.stringify(manifest, null, 2).length;
  const metrics = builds.map((build) => build.metrics);

  if (reportFile) {
    await mkdir(path.dirname(reportFile), { recursive: true });
    await writeFile(reportFile, reportMarkdown(metrics, jsonBytes));
  }
  const failed = [...metrics, ...resampled.map(({ metrics: row }) => row)].filter((row) => row.failures.length > 0);

  if (failed.length > 0) {
    console.error(`\n${failed.length} emotion(s) failed the gates; generated files were not written.`);
    process.exit(1);
  }

  await mkdir(OUT_DIR, { recursive: true });
  await writeJsonFile(path.join(OUT_DIR, 'mushroom-emotions.generated.json'), manifest);
  await writeJsonFile(path.join(OUT_DIR, 'mushroom-hat.generated.json'), hat);
  console.log(
    `\nwrote ${path.relative(path.join(import.meta.dirname, '../..'), OUT_DIR)}/mushroom-emotions.generated.json (${(jsonBytes / 1024).toFixed(0)} KB) and mushroom-hat.generated.json`,
  );
};

run().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
