import { MUSHROOM_IDLE_BASE } from '../../constants/mushroom-idle-profiles';
import type { BodyLayerKey } from '../../constants/mushroom-layout';
import { uniform } from '../../helpers/idle-scheduler';
import type { MushroomScenarioContext } from '../mushroom-scenario-context';
import { chainForever, type IdleLoop } from './idle-loop';

const GRADIENT_CENTER = 0.5;
const DRIFT_FRACTION = 0.05;
const LAYERS: readonly BodyLayerKey[] = ['halo', 'tint', 'core'];

/*
 * The blob's slow shimmer: every radial gradient's centre wanders (one
 * timeline, each layer with its own length), and the tint ellipse rocks a few
 * degrees. No filters, only attributes and a rotation, so it stays cheap.
 */
export const createShimmerLoop = (context: MushroomScenarioContext): IdleLoop => {
  const { driftMs, tintRotateDeg } = MUSHROOM_IDLE_BASE.shimmer;
  const drift = (): number => GRADIENT_CENTER + uniform(context.rng, { min: -DRIFT_FRACTION, max: DRIFT_FRACTION });
  const loops: IdleLoop[] = [
    chainForever(context.rig, () => {
      const timeline = context.rig.gsap.timeline();

      for (const key of LAYERS) {
        const gradient = context.gradient(key);

        if (gradient) {
          timeline.to(
            gradient,
            {
              attr: { cx: drift(), cy: drift() },
              duration: context.seconds(uniform(context.rng, driftMs)),
              ease: 'sine.inOut',
            },
            0,
          );
        }
      }

      return timeline;
    }),
  ];
  const tint = context.ellipse('tint');

  if (tint) {
    let direction = 1;

    loops.push(
      chainForever(context.rig, () => {
        direction = -direction;

        return context.rig.gsap.to(tint, {
          rotation: tintRotateDeg * direction,
          duration: context.seconds(uniform(context.rng, driftMs)),
          ease: 'sine.inOut',
          transformOrigin: '50% 50%',
        });
      }),
    );
  }

  return {
    stop: () => {
      for (const loop of loops) loop.stop();
    },
  };
};
