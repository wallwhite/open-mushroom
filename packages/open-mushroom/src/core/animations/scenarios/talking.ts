import { MUSHROOM_SCENARIO } from '../../constants/mushroom-scenario-timings';
import { uniform } from '../../helpers/idle-scheduler';
import { chainForever, type IdleLoop } from '../idle/idle-loop';
import type { MushroomScenarioContext } from '../mushroom-scenario-context';

/* Mouth chatter while the assistant streams text: quick squash/stretch around the mouth centre with random pauses. */
export const createTalkingLoop = (context: MushroomScenarioContext): IdleLoop => {
  const { open, closed, stepMs, pauseMs } = MUSHROOM_SCENARIO.talking;

  return chainForever(context.rig, () => {
    const mouth = context.slot('mouth');

    if (!mouth) return null;
    const transformOrigin = context.originFor(mouth, context.frame.anchors.mouth);
    const step = context.seconds(stepMs);

    return context.rig.gsap
      .timeline()
      .to(mouth, { scaleY: open, duration: step, ease: 'power1.out', transformOrigin }, 0)
      .to(mouth, { scaleY: closed, duration: step, ease: 'power1.inOut' }, step)
      .to(mouth, { scaleY: 1, duration: step, ease: 'power1.in' }, step + step)
      .to({}, { duration: context.seconds(uniform(context.rng, pauseMs)) });
  });
};
