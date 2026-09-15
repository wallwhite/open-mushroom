/*
 * Visual QA frames of the lab, driven through the headless handle the page exposes:
 * ten emotion pairs held at 50 % of the morph, the seven resting faces, talking,
 * reduced motion and the speech bubble, plus the animation counters. Frames land
 * in qa/out next to a summary; a counter outside its band fails the run.
 *
 * Needs the lab served (`pnpm dev` or `next start`) and the agent-browser CLI.
 * Usage: pnpm qa:frames [--base http://localhost:3001] [--out qa/out]
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { MUSHROOM_EMOTIONS, type MushroomEmotion } from 'open-mushroom/core';

import { browserEval, browserRun, waitInPage } from './browser-driver';

const PAIRS: ReadonlyArray<[MushroomEmotion, MushroomEmotion]> = [
  ['neutral', 'staring'],
  ['neutral', 'thinking'],
  ['staring', 'thinking'],
  ['thinking', 'angry'],
  ['angry', 'excited'],
  ['excited', 'sleep'],
  ['sleep', 'drunk'],
  ['drunk', 'neutral'],
  ['neutral', 'angry'],
  ['thinking', 'sleep'],
];
const PREVIEW = '[data-lab-preview]';
const REST_TWEENS = { min: 2, max: 5 };
const STRESS_SWITCHES = 30;
const STRESS_INTERVAL_MS = 200;
const SETTLE_MS = 2500;
const BUBBLE_SWING_MS = 1000;

const argument = (name: string, fallback: string): string => {
  const index = process.argv.indexOf(name);

  return index >= 0 ? (process.argv[index + 1] ?? fallback) : fallback;
};

const base = argument('--base', 'http://localhost:3001');
const out = path.resolve(argument('--out', 'qa/out'));
const failures: string[] = [];
const summary: Record<string, unknown> = {};

const shot = (name: string): void => {
  browserRun('screenshot', PREVIEW, path.join(out, `${name}.png`));
};

const settle = (): void => {
  waitInPage(`!window.__mushroomLab.snapshot().transitioning`, SETTLE_MS);
};

const expectBand = (label: string, value: number, min: number, max: number): void => {
  summary[label] = value;
  if (value < min || value > max) failures.push(`${label}: ${value} outside ${min}–${max}`);
};

mkdirSync(out, { recursive: true });
browserRun('open', `${base}/en`);
browserRun('set', 'viewport', '1440', '900');
browserRun('wait', '--load', 'networkidle');
waitInPage(`window.__mushroomLab?.snapshot().ready === true`, SETTLE_MS);

/* Resting faces and the counters at rest. */
for (const emotion of MUSHROOM_EMOTIONS) {
  browserEval(`window.__mushroomLab.setEmotion('${emotion}')`);
  settle();
  shot(`rest-${emotion}`);
}
expectBand(
  'restActiveTweens',
  browserEval<number>('window.__mushroomLab.snapshot().activeTweens'),
  REST_TWEENS.min,
  REST_TWEENS.max,
);

/* Pairs frozen halfway: the rig pauses each new morph at 50 % while the hold is on. */
for (const [from, to] of PAIRS) {
  browserEval(`window.__mushroomLab.setEmotion('${from}')`);
  settle();
  browserEval(`window.__mushroomLab.holdAt(0.5); window.__mushroomLab.setEmotion('${to}')`);
  waitInPage(
    `window.__mushroomLab.snapshot().progress !== null && window.__mushroomLab.snapshot().progress >= 0.5`,
    SETTLE_MS,
  );
  shot(`pair-${from}-${to}-050`);
  browserEval(`window.__mushroomLab.holdAt(null); window.__mushroomLab.play()`);
  settle();
}

/* Talking is a panel toggle; the label text is the stable hook. */
browserEval(`window.__mushroomLab.setEmotion('excited')`);
settle();
browserEval(
  `[...document.querySelectorAll('label')].find((l) => l.textContent.includes('talking')).querySelector('input').click()`,
);
waitInPage(`document.querySelector('${PREVIEW} svg[data-mushroom-talking]') !== null`, SETTLE_MS);
shot('talking-excited');
browserEval(
  `[...document.querySelectorAll('label')].find((l) => l.textContent.includes('talking')).querySelector('input').click()`,
);

/* The bubble at the start of its swing and once it has settled. */
browserEval(`window.__mushroomLab.showBubble('Water first. Then we discuss the cookies.')`);
shot('bubble-0s');
browserRun('wait', String(BUBBLE_SWING_MS));
shot('bubble-1s');

/* Thirty quick switches must not leave animations behind. */
browserEval(
  `(async () => { const wait = (ms) => new Promise((r) => setTimeout(r, ms)); for (let i = 0; i < ${STRESS_SWITCHES}; i += 1) { window.__mushroomLab.setEmotion(i % 2 ? 'angry' : 'neutral'); await wait(${STRESS_INTERVAL_MS}); } })()`,
);
settle();
browserRun('wait', String(SETTLE_MS));
expectBand(
  'afterStressActiveTweens',
  browserEval<number>('window.__mushroomLab.snapshot().activeTweens'),
  REST_TWEENS.min,
  REST_TWEENS.max,
);

/* Unmounting the preview must leave the page without live animations. */
browserEval(`window.__mushroomLab.setMounted(false)`);
browserRun('wait', String(SETTLE_MS));
expectBand('afterUnmountPageTweens', browserEval<number>('window.__mushroomLab.pageActiveTweens()'), 0, 0);
browserEval(`window.__mushroomLab.setMounted(true)`);
waitInPage(`window.__mushroomLab.snapshot().ready === true`, SETTLE_MS);

/* Reduced motion: no idle life, emotion changes as cuts. */
browserRun('set', 'media', 'reduced-motion');
browserRun('open', `${base}/en`);
browserRun('wait', '--load', 'networkidle');
waitInPage(`window.__mushroomLab?.snapshot().ready === true`, SETTLE_MS);
browserEval(`window.__mushroomLab.setEmotion('angry')`);
shot('reduced-motion-angry-immediate');
expectBand('reducedMotionActiveTweens', browserEval<number>('window.__mushroomLab.snapshot().activeTweens'), 0, 0);

writeFileSync(path.join(out, 'summary.json'), `${JSON.stringify({ base, failures, ...summary }, null, 2)}\n`);
browserRun('close');
console.log(JSON.stringify({ frames: out, failures, ...summary }, null, 2));
if (failures.length > 0) process.exit(1);
