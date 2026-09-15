import { MUSHROOM_IDLE_BASE } from '../../constants/mushroom-idle-profiles';
import { BODY_ELLIPSES, FACE_CONTENT_CENTER } from '../../constants/mushroom-layout';
import { nextBreathDepth, nextBreathMs, nextHatLagMs } from '../../helpers/idle-scheduler';
import type { MushroomScenarioContext } from '../mushroom-scenario-context';
import { chainForever, type IdleLoop } from './idle-loop';

const HALF = 2;
const EASE = 'sine.inOut';

/*
 * Breathing, on two clocks. The head — face and hat — takes about two seconds
 * per breath: the face lifts and swells, the hat follows a fraction of the
 * cycle later and catches up by the end, so the layers never move as one block.
 * Underneath, the body blob keeps a much slower swell of its own, which is
 * what stops the quick bob from reading as a bounce. Every breath draws a
 * fresh length, depth and hat delay. Runs on the outer animated groups only;
 * scenarios use the inner ones, so transforms never fight.
 */
const createHeadLoop = (context: MushroomScenarioContext): IdleLoop => {
  const { faceScale, faceDy, hatDy, inhaleShare } = MUSHROOM_IDLE_BASE.breathe;

  return chainForever(context.rig, () => {
    // Read per breath: the profile follows the emotion.
    const { face, hat, profile, rig, rng, seconds, originFor } = context;
    const breath = nextBreathMs(rng, profile.breatheHeadMs);
    const depth = nextBreathDepth(rng) * profile.breatheAmp;
    const lag = seconds(nextHatLagMs(rng, breath));
    const rise = seconds(breath * inhaleShare);
    const fall = seconds(breath) - rise;
    // Face and hat share one lift, so a shallow-breathing emotion never lets the hat drift off the head.
    const lift = depth * profile.breatheHeadLift;
    const timeline = rig.gsap.timeline();

    if (face) {
      const transformOrigin = originFor(face, FACE_CONTENT_CENTER);

      timeline
        .to(face, { scale: 1 + faceScale * lift, y: faceDy * lift, duration: rise, ease: EASE, transformOrigin }, 0)
        .to(face, { scale: 1, y: 0, duration: fall, ease: EASE }, rise);
    }
    // The hat starts late and still lands on the beat, so it travels the rest of the cycle.
    if (hat) {
      const squeeze = (seconds(breath) - lag) / seconds(breath);

      timeline
        .to(hat, { y: hatDy * lift, duration: rise * squeeze, ease: EASE }, lag)
        .to(hat, { y: 0, duration: fall * squeeze, ease: EASE }, lag + rise * squeeze);
    }

    return timeline;
  });
};

/* The blob only ever swells — no travel in x or y, or the gradient would slide under the ink. */
const createBodyLoop = (context: MushroomScenarioContext): IdleLoop => {
  const { bodyScale } = MUSHROOM_IDLE_BASE.breathe;
  const halo = BODY_ELLIPSES.find((ellipse) => ellipse.key === 'halo');

  return chainForever(context.rig, () => {
    const { body, profile, rig, rng, seconds } = context;

    if (!body || !halo) return null;
    const half = seconds(nextBreathMs(rng, profile.breatheBodyMs) / HALF);
    const transformOrigin = context.originFor(body, { x: halo.cx, y: halo.cy });

    return rig.gsap
      .timeline()
      .to(body, { scale: 1 + bodyScale * profile.breatheAmp, duration: half, ease: EASE, transformOrigin }, 0)
      .to(body, { scale: 1, duration: half, ease: EASE }, half);
  });
};

export const createBreatheLoop = (context: MushroomScenarioContext): IdleLoop => {
  const loops = [createHeadLoop(context), createBodyLoop(context)];

  return {
    stop: () => {
      for (const loop of loops) loop.stop();
    },
  };
};
