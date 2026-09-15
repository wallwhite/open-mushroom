import { MUSHROOM_IDLE_BASE } from '../../constants/mushroom-idle-profiles';
import { MUSHROOM_EYE_SIDES } from '../../constants/mushroom-slots';
import { nextBlinkDelayMs, shouldDoubleBlink } from '../../helpers/idle-scheduler';
import type { MushroomTimeline, MushroomTween } from '../mushroom-gsap';
import { eyeAnchor, type MushroomScenarioContext } from '../mushroom-scenario-context';
import type { IdleLoop } from './idle-loop';

export interface BlinkLoop extends IdleLoop {
  blinkNow: () => void;
}

/*
 * Irregular blinking: each eye group squashes vertically around its own eye
 * centre (the ring meets the nose bridge at mid-height, so the joint barely
 * moves). Depth comes from the profile: none asleep, shallow when drunk.
 * The context is read live, never destructured: the emotion changes under it.
 */
export const createBlinkLoop = (context: MushroomScenarioContext): BlinkLoop => {
  let stopped = false;
  let pending: MushroomTween | null = null;
  let running: MushroomTimeline | null = null;

  const addBlink = (timeline: MushroomTimeline, at: number): number => {
    const { closeMs, openMs } = MUSHROOM_IDLE_BASE.blink;
    const closed = 1 - context.profile.blinkDepth;
    const close = context.seconds(closeMs);
    const open = context.seconds(openMs);

    for (const side of MUSHROOM_EYE_SIDES) {
      const eye = context.eye(side);

      if (!eye) continue;
      const transformOrigin = context.originFor(eye, eyeAnchor(context.frame, side));

      timeline
        .to(eye, { scaleY: closed, duration: close, ease: 'power2.in', transformOrigin }, at)
        .to(eye, { scaleY: 1, duration: open, ease: 'power2.out' }, at + close);
    }

    return at + close + open;
  };

  const fire = (): void => {
    if (stopped) return;
    const queueNext = (): void => {
      pending = context.rig.track(
        context.rig.gsap.delayedCall(context.seconds(nextBlinkDelayMs(context.rng, context.profile)), fire),
      );
    };

    if (context.profile.blinkDepth === 0) {
      queueNext();

      return;
    }
    running = context.rig.context.add(() => {
      const timeline = context.rig.gsap.timeline({
        onComplete: () => {
          running = null;
          queueNext();
        },
      });
      const end = addBlink(timeline, 0);

      if (shouldDoubleBlink(context.rng))
        addBlink(timeline, end + context.seconds(MUSHROOM_IDLE_BASE.blink.doublePauseMs));

      return context.rig.track(timeline);
    });
  };

  pending = context.rig.track(
    context.rig.gsap.delayedCall(context.seconds(nextBlinkDelayMs(context.rng, context.profile)), fire),
  );

  return {
    blinkNow: () => {
      if (running) return;
      pending?.kill();
      fire();
    },
    stop: () => {
      stopped = true;
      pending?.kill();
      running?.revert();
    },
  };
};
