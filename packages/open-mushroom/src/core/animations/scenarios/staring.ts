import { FACE_CONTENT_CENTER } from '../../constants/mushroom-layout';
import { MUSHROOM_SCENARIO } from '../../constants/mushroom-scenario-timings';
import type { MushroomTimeline } from '../mushroom-gsap';
import type { MushroomScenarioContext } from '../mushroom-scenario-context';

/* A slight tilt and shift to the side, held while staring; the profile keeps the gaze right and blinks rare. */
export const staringScenario = (context: MushroomScenarioContext): MushroomTimeline | null => {
  const face = context.faceScenario;

  if (!face) return null;
  const { tiltDeg, shiftX, settleMs } = MUSHROOM_SCENARIO.staring;

  return context.rig.gsap.timeline().to(face, {
    rotation: tiltDeg,
    x: shiftX,
    duration: context.seconds(settleMs),
    ease: 'power2.out',
    transformOrigin: context.originFor(face, FACE_CONTENT_CENTER),
  });
};
