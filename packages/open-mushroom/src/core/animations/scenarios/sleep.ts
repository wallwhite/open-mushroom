import { MUSHROOM_SCENARIO } from '../../constants/mushroom-scenario-timings';
import { pathDataBounds } from '../../helpers/path-data-bounds';
import type { MushroomTimeline } from '../mushroom-gsap';
import type { MushroomScenarioContext } from '../mushroom-scenario-context';

const HALF = 2;

/* Drool stretches down from the lip and back, slowly; blink and gaze are off through the profile. */
export const sleepScenario = (context: MushroomScenarioContext): MushroomTimeline | null => {
  const ink = context.slot('drool-ink');
  const white = context.slot('drool-white');
  const d = context.frame.slots['drool-ink'];

  if (!ink || !white || !d) return null;
  const bounds = pathDataBounds(d);
  const top = { x: (bounds.minX + bounds.maxX) / HALF, y: bounds.minY };
  const { droolScaleY, droolMs } = MUSHROOM_SCENARIO.sleep;
  const duration = context.seconds(droolMs);
  const ease = 'sine.inOut';

  return context.rig.gsap
    .timeline({ repeat: -1, yoyo: true })
    .to(ink, { scaleY: droolScaleY, duration, ease, transformOrigin: context.originFor(ink, top) }, 0)
    .to(white, { scaleY: droolScaleY, duration, ease, transformOrigin: context.originFor(white, top) }, 0);
};
