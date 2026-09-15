import { MUSHROOM_IDLE_BASE } from '../../constants/mushroom-idle-profiles';
import { MUSHROOM_EYE_SIDES, MUSHROOM_EYE_SLOTS, type MushroomEyeSide } from '../../constants/mushroom-slots';
import { gazeOffset, nextSaccade } from '../../helpers/idle-scheduler';
import { pathDataBounds } from '../../helpers/path-data-bounds';
import type { MushroomTween } from '../mushroom-gsap';
import type { MushroomScenarioContext } from '../mushroom-scenario-context';
import type { IdleLoop } from './idle-loop';

export interface GazeLoop extends IdleLoop {
  lookAt: (dx: number, dy: number) => void;
  /* Re-centre for a new emotion (travel box and centre come from its frame/profile). */
  refresh: () => void;
}

interface GazePoint {
  dx: number;
  dy: number;
}

/*
 * Saccades: the inner pupil group jumps to a new resting point inside an
 * ellipse of the white, holds, repeats. The clip stays on the still wrapper,
 * so the pupil is cropped by the white wherever it goes. quickTo keeps two
 * tweens per eye alive instead of allocating one per saccade.
 */
export const createGazeLoop = (context: MushroomScenarioContext): GazeLoop => {
  const { saccadeMs, lookAtHoldMs, holdMs } = MUSHROOM_IDLE_BASE.gaze;
  let stopped = false;
  let pending: MushroomTween | null = null;
  let overrideUntil = 0;
  const movers = MUSHROOM_EYE_SIDES.flatMap((side) => {
    const pupil = context.pupil(side);

    if (!pupil) return [];
    const options = { duration: context.seconds(saccadeMs), ease: 'power3.out' };
    const x = context.rig.gsap.quickTo(pupil, 'x', options);
    const y = context.rig.gsap.quickTo(pupil, 'y', options);

    context.rig.trackPersistent(x.tween);
    context.rig.trackPersistent(y.tween);

    return [{ side, x, y }];
  });

  const whiteBox = (side: MushroomEyeSide): { width: number; height: number } | null => {
    const d = context.frame.slots[MUSHROOM_EYE_SLOTS[side].white];

    if (!d) return null;
    const bounds = pathDataBounds(d);

    return { width: bounds.maxX - bounds.minX, height: bounds.maxY - bounds.minY };
  };

  const moveTo = (target: GazePoint): void => {
    for (const mover of movers) {
      const box = whiteBox(mover.side);
      const offset = box ? gazeOffset(target, box) : { x: 0, y: 0 };

      mover.x(offset.x);
      mover.y(offset.y);
    }
  };

  /* One saccade, then re-arm itself after the hold. */
  const step = (): void => {
    if (stopped) return;
    const remaining = overrideUntil - performance.now();
    const arm = (delayMs: number): void => {
      pending?.kill();
      pending = context.rig.track(context.rig.gsap.delayedCall(context.seconds(delayMs), step));
    };

    if (remaining > 0) {
      arm(remaining);

      return;
    }
    if (!context.profile.gazeEnabled) return;
    const target = nextSaccade(context.rng, context.profile);

    moveTo(target);
    arm(target.holdMs);
  };

  const schedule = (delayMs: number): void => {
    if (stopped) return;
    pending?.kill();
    pending = context.rig.track(context.rig.gsap.delayedCall(context.seconds(delayMs), step));
  };

  const refresh = (): void => {
    overrideUntil = 0;
    if (context.profile.gazeEnabled) {
      moveTo(context.profile.gazeCenter);
      schedule(holdMs.min);
    } else {
      pending?.kill();
      moveTo({ dx: 0, dy: 0 });
    }
  };

  refresh();

  return {
    refresh,
    lookAt: (dx, dy) => {
      moveTo({ dx, dy });
      overrideUntil = performance.now() + lookAtHoldMs;
      schedule(lookAtHoldMs);
    },
    stop: () => {
      stopped = true;
      pending?.kill();
      for (const mover of movers) {
        mover.x.tween.kill();
        mover.y.tween.kill();
      }
    },
  };
};
