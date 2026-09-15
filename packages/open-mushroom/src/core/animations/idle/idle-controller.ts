import type { MushroomEmotion } from '../../constants/mushroom-emotions';
import type { MushroomRig } from '../mushroom-rig-context';
import { createScenarioContext, type MushroomScenarioContext } from '../mushroom-scenario-context';
import { createTalkingLoop } from '../scenarios/talking';
import { type BlinkLoop, createBlinkLoop } from './blink';
import { createBreatheLoop } from './breathe';
import { createGazeLoop, type GazeLoop } from './gaze';
import type { IdleLoop } from './idle-loop';
import { createShimmerLoop } from './shimmer';

/* Which idle layers run; the `idle` prop maps to this (true = all). */
export interface MushroomIdleParts {
  blink: boolean;
  gaze: boolean;
  breathe: boolean;
  shimmer: boolean;
}

export const ALL_IDLE_PARTS: MushroomIdleParts = { blink: true, gaze: true, breathe: true, shimmer: true };
export const NO_IDLE_PARTS: MushroomIdleParts = { blink: false, gaze: false, breathe: false, shimmer: false };

/* Starts a loop that is wanted but missing, stops one that is running but no longer wanted. */
const toggle = <T extends IdleLoop>(current: T | null, wanted: boolean, create: () => T): T | null => {
  if (wanted && !current) return create();
  if (!wanted && current) {
    current.stop();

    return null;
  }

  return current;
};

export interface MushroomIdleController {
  context: MushroomScenarioContext;
  setEmotion: (emotion: MushroomEmotion) => void;
  setParts: (parts: MushroomIdleParts) => void;
  setTalking: (talking: boolean) => void;
  blinkNow: () => void;
  lookAt: (dx: number, dy: number) => void;
  dispose: () => void;
}

/*
 * Owns the always-on life of one rig. Loops are created lazily per part and
 * stopped individually, so the lab can toggle one layer without touching the
 * others; `dispose` stops everything (the rig registry double-checks on unmount).
 */
export const createIdleController = (
  rig: MushroomRig,
  emotion: MushroomEmotion,
  parts: MushroomIdleParts,
  rng: () => number,
): MushroomIdleController => {
  const context = createScenarioContext(rig, emotion, rng);
  let blink: BlinkLoop | null = null;
  let gaze: GazeLoop | null = null;
  let breathe: IdleLoop | null = null;
  let shimmer: IdleLoop | null = null;
  let talking: IdleLoop | null = null;

  const setParts = (next: MushroomIdleParts): void => {
    blink = toggle(blink, next.blink, () => createBlinkLoop(context));
    gaze = toggle(gaze, next.gaze, () => createGazeLoop(context));
    breathe = toggle(breathe, next.breathe, () => createBreatheLoop(context));
    shimmer = toggle(shimmer, next.shimmer, () => createShimmerLoop(context));
  };

  setParts(parts);

  return {
    context,
    setEmotion: (next) => {
      context.setEmotion(next);
      gaze?.refresh();
    },
    setParts,
    setTalking: (on) => {
      if (on && !talking) talking = createTalkingLoop(context);
      if (!on && talking) {
        talking.stop();
        talking = null;
        const mouth = context.slot('mouth');

        if (mouth) rig.gsap.set(mouth, { scaleY: 1 });
      }
    },
    blinkNow: () => blink?.blinkNow(),
    lookAt: (dx, dy) => gaze?.lookAt(dx, dy),
    dispose: () => {
      setParts(NO_IDLE_PARTS);
      talking?.stop();
      talking = null;
    },
  };
};
