import { FACE_CONTENT_CENTER } from '../../constants/mushroom-layout';
import { MUSHROOM_SCENARIO } from '../../constants/mushroom-scenario-timings';
import { MUSHROOM_EYE_SIDES } from '../../constants/mushroom-slots';
import type { MushroomTimeline } from '../mushroom-gsap';
import type { MushroomScenarioContext } from '../mushroom-scenario-context';

/* A pop on entry: face springs, hat bounces, pupils dilate (and stay dilated), the halo flares once. */
export const excitedScenario = (context: MushroomScenarioContext): MushroomTimeline | null => {
  const face = context.faceScenario;

  if (!face) return null;
  const { gsap } = context.rig;
  const { popScale, popMs, hatBounceY, hatMs, hatDelayMs, pupilScale, pupilMs, haloScale, haloMs } =
    MUSHROOM_SCENARIO.excited;
  const timeline = gsap.timeline();

  timeline.fromTo(
    face,
    { scale: popScale, transformOrigin: context.originFor(face, FACE_CONTENT_CENTER) },
    { scale: 1, duration: context.seconds(popMs), ease: 'elastic.out(1, 0.5)' },
    0,
  );
  if (context.hatScenario) {
    timeline.fromTo(
      context.hatScenario,
      { y: hatBounceY },
      { y: 0, duration: context.seconds(hatMs), ease: 'bounce.out' },
      context.seconds(hatDelayMs),
    );
  }
  for (const side of MUSHROOM_EYE_SIDES) {
    const pupil = context.pupil(side);
    const circle = context.frame.pupils[side];

    if (pupil && circle) {
      const transformOrigin = context.originFor(pupil, { x: circle.cx, y: circle.cy });

      timeline.to(
        pupil,
        { scale: pupilScale, duration: context.seconds(pupilMs), ease: 'power2.out', transformOrigin },
        0,
      );
    }
  }
  const halo = context.ellipse('halo');

  if (halo) {
    timeline.to(
      halo,
      {
        scale: haloScale,
        duration: context.seconds(haloMs),
        ease: 'sine.inOut',
        yoyo: true,
        repeat: 1,
        transformOrigin: '50% 50%',
      },
      0,
    );
  }

  return timeline;
};
