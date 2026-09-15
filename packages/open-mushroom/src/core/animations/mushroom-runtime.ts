import type { MushroomEmotion } from '../constants/mushroom-emotions';
import { MUSHROOM_FRAMES } from '../constants/mushroom-manifest';
import { MUSHROOM_MORPH_TUNING } from '../constants/mushroom-morph-tuning';
import { MUSHROOM_PALETTES } from '../constants/mushroom-palettes';
import { MUSHROOM_TIMINGS } from '../constants/mushroom-timings';
import { nextEmotionHop } from '../helpers/mushroom-emotion-route';
import { planTransition } from '../helpers/mushroom-transition-plan';
import type { MushroomHandle, MushroomRigSnapshot } from '../types/mushroom-handle';
import { createIdleController, type MushroomIdleController, type MushroomIdleParts } from './idle/idle-controller';
import { buildEmotionTransition } from './morph-to-emotion';
import type { MushroomGsap, MushroomTimeline } from './mushroom-gsap';
import { createMushroomRig, type MushroomRig } from './mushroom-rig-context';
import { MUSHROOM_SCENARIOS } from './scenarios';

/*
 * The per-instance brain behind useMushroomRig, free of React: owns the rig,
 * the idle controller and the current scenario, and turns target-emotion
 * changes into transitions. Latest wins: a change mid-transition fast-forwards
 * the running timeline, then the next one starts from the frame actually
 * shown. Reduced motion means instant frames and no life at all.
 */
export interface MushroomRuntime extends MushroomHandle {
  attach: (gsapInstance: MushroomGsap, svg: SVGSVGElement) => void;
  detach: () => void;
  setTarget: (emotion: MushroomEmotion) => void;
  setTalking: (talking: boolean) => void;
  setIdle: (parts: MushroomIdleParts) => void;
  setReducedMotion: (reduced: boolean) => void;
}

interface RuntimeInit {
  emotion: MushroomEmotion;
  talking: boolean;
  idle: MushroomIdleParts;
}

const rng = (): number => Math.random();

export const createMushroomRuntime = (init: RuntimeInit): MushroomRuntime => {
  let rig: MushroomRig | null = null;
  let controller: MushroomIdleController | null = null;
  let scenario: MushroomTimeline | null = null;
  let active: MushroomTimeline | null = null;
  let shown = init.emotion;
  let target = init.emotion;
  let reducedMotion = false;
  /* True until the first sync after GSAP loads: catching up must not animate. */
  let catchingUp = true;
  let { talking } = init;
  let { idle } = init;

  const stopScenario = (): void => {
    scenario?.revert();
    scenario = null;
  };

  const startScenario = (emotion: MushroomEmotion): void => {
    stopScenario();
    // No idle life (thumbnails) means a still picture: no scenario either.
    if (!rig || !controller || reducedMotion || !Object.values(idle).some(Boolean)) return;
    const factory = MUSHROOM_SCENARIOS[emotion];
    const owner = rig;
    const { context } = controller;

    if (!factory) return;
    scenario = owner.context.add(() => {
      const timeline = factory(context);

      return timeline ? owner.track(timeline) : null;
    });
  };

  /* Idle life exists whenever motion is allowed; reduced motion tears it down. */
  const syncController = (): void => {
    if (!rig || reducedMotion) {
      controller?.dispose();
      controller = null;
      stopScenario();

      return;
    }
    if (!controller) {
      controller = createIdleController(rig, shown, idle, rng);
      controller.setTalking(talking);
    }
  };

  const advance = (): void => {
    if (!rig) return;
    if (active) {
      // A change mid-transition: play the running one out fast (even if the lab paused it), then continue.
      active.timeScale(MUSHROOM_TIMINGS.interruptTimeScale).resume();

      return;
    }
    if (target === shown) {
      if (catchingUp) startScenario(shown);
      catchingUp = false;

      return;
    }
    const from = shown;
    // A face with an approach is reached in two moves; onComplete calls back in and walks the next leg.
    const to = nextEmotionHop(shown, target);
    const instant = reducedMotion || catchingUp;

    if (to === target) catchingUp = false;
    controller?.setEmotion(to);
    stopScenario();
    active = buildEmotionTransition({
      rig,
      ops: planTransition(MUSHROOM_FRAMES[from], MUSHROOM_FRAMES[to]),
      from,
      to,
      palette: MUSHROOM_PALETTES[to],
      tuning: MUSHROOM_MORPH_TUNING,
      instant,
      onScenarioPoint: () => {
        if (target === to) startScenario(to);
      },
      onComplete: () => {
        shown = to;
        active = null;
        advance();
      },
    });
  };

  const snapshot = (): MushroomRigSnapshot => ({ shown, target, transitioning: active !== null, ready: rig !== null });

  return {
    attach: (gsapInstance, svg) => {
      rig = createMushroomRig(gsapInstance, svg);
      catchingUp = true;
      syncController();
      advance();
    },
    detach: () => {
      controller?.dispose();
      controller = null;
      stopScenario();
      // Killing leaves the SVG at whatever frame it shows; `shown` keeps tracking it for a re-attach (Fast Refresh).
      rig?.dispose();
      rig = null;
      active = null;
    },
    setTarget: (emotion) => {
      target = emotion;
      advance();
    },
    setTalking: (next) => {
      talking = next;
      controller?.setTalking(next);
    },
    setIdle: (parts) => {
      idle = parts;
      controller?.setParts(parts);
    },
    setReducedMotion: (reduced) => {
      reducedMotion = reduced;
      syncController();
    },
    blink: () => controller?.blinkNow(),
    lookAt: (dx, dy) => controller?.lookAt(dx, dy),
    getActiveTweenCount: () => rig?.activeCount() ?? 0,
    getActiveTargets: () => rig?.describeActive() ?? [],
    getActiveTimeline: () => active,
    getSnapshot: snapshot,
  };
};
