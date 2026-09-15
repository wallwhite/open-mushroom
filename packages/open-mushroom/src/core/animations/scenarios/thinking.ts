import { MUSHROOM_SCENARIO } from '../../constants/mushroom-scenario-timings';
import type { MushroomTimeline } from '../mushroom-gsap';
import type { MushroomScenarioContext } from '../mushroom-scenario-context';

/* The hand scratches the chin: a slow rock around the wrist, forever. Gaze goes up-right through the idle profile. */
export const thinkingScenario = (context: MushroomScenarioContext): MushroomTimeline | null => {
  const hand = context.slot('hand');
  const wrist = context.frame.anchors.hand;

  if (!hand || !wrist) return null;
  const { handSwingDeg, swingMs } = MUSHROOM_SCENARIO.thinking;

  return context.rig.gsap
    .timeline({ repeat: -1, yoyo: true })
    .fromTo(
      hand,
      { rotation: -handSwingDeg, transformOrigin: context.originFor(hand, wrist) },
      { rotation: handSwingDeg, duration: context.seconds(swingMs), ease: 'sine.inOut' },
    );
};
