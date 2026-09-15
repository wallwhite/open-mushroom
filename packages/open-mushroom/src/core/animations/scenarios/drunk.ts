import { MUSHROOM_SCENARIO } from '../../constants/mushroom-scenario-timings';
import type { MushroomTimeline } from '../mushroom-gsap';
import type { MushroomScenarioContext } from '../mushroom-scenario-context';

/* Sways and drifts on desynchronised cycles; the mouth skews along. */
export const drunkScenario = (context: MushroomScenarioContext): MushroomTimeline | null => {
  const face = context.faceScenario;
  const mouth = context.slot('mouth');

  if (!face) return null;
  const { gsap } = context.rig;
  const { swayDeg, swayMs, driftX, driftMs, mouthSkewDeg, mouthMs } = MUSHROOM_SCENARIO.drunk;
  const ease = 'sine.inOut';
  const timeline = gsap.timeline({ repeat: -1 });

  timeline.add(
    gsap.fromTo(
      face,
      { rotation: -swayDeg, transformOrigin: context.originFor(face, context.frame.anchors.mouth) },
      { rotation: swayDeg, duration: context.seconds(swayMs), ease, yoyo: true, repeat: -1 },
    ),
    0,
  );
  timeline.add(
    gsap.fromTo(face, { x: -driftX }, { x: driftX, duration: context.seconds(driftMs), ease, yoyo: true, repeat: -1 }),
    0,
  );
  if (mouth) {
    timeline.add(
      gsap.fromTo(
        mouth,
        { skewX: -mouthSkewDeg, transformOrigin: context.originFor(mouth, context.frame.anchors.mouth) },
        { skewX: mouthSkewDeg, duration: context.seconds(mouthMs), ease, yoyo: true, repeat: -1 },
      ),
      0,
    );
  }

  return timeline;
};
