import { MUSHROOM_SCENARIO } from '../../constants/mushroom-scenario-timings';
import { uniform } from '../../helpers/idle-scheduler';
import type { MushroomTimeline } from '../mushroom-gsap';
import type { MushroomScenarioContext } from '../mushroom-scenario-context';

const EVEN = 2;

/* A short shake on entry, the body core pulsing, and the right brow twitching every few seconds. */
export const angryScenario = (context: MushroomScenarioContext): MushroomTimeline | null => {
  const face = context.faceScenario;

  if (!face) return null;
  const { gsap } = context.rig;
  const { shakeX, shakeMs, shakes, browPulse, browPulseMs, browPeriodMs, corePulse, coreMs } = MUSHROOM_SCENARIO.angry;
  const timeline = gsap.timeline();
  const shake = gsap.timeline();

  for (let i = 0; i < shakes; i += 1) {
    shake.to(face, { x: i % EVEN === 0 ? shakeX : -shakeX, duration: context.seconds(shakeMs), ease: 'power1.inOut' });
  }
  shake.to(face, { x: 0, duration: context.seconds(shakeMs) });
  timeline.add(shake, 0);

  const core = context.ellipse('core');

  if (core) {
    timeline.add(
      gsap.to(core, {
        scale: corePulse,
        duration: context.seconds(coreMs),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        transformOrigin: '50% 50%',
      }),
      0,
    );
  }
  const brow = context.slot('brow-right');

  if (brow && context.frame.slots['brow-right']) {
    const period = context.seconds(uniform(context.rng, browPeriodMs));

    timeline.add(
      gsap.to(brow, {
        scaleY: browPulse,
        duration: context.seconds(browPulseMs),
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        repeatDelay: period,
        transformOrigin: context.originFor(brow, context.frame.anchors.eyeRight),
      }),
      period,
    );
  }

  return timeline;
};
