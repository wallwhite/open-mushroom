import type { MushroomEmotion } from '../../constants/mushroom-emotions';
import type { MushroomTimeline } from '../mushroom-gsap';
import type { MushroomScenarioContext } from '../mushroom-scenario-context';
import { angryScenario } from './angry';
import { drunkScenario } from './drunk';
import { excitedScenario } from './excited';
import { sleepScenario } from './sleep';
import { staringScenario } from './staring';
import { thinkingScenario } from './thinking';

/*
 * One timeline per emotion on top of the morph. The rig creates it inside its
 * context, tracks it, and reverts it (restoring every property it touched)
 * when the emotion changes. Neutral has no scenario: idle life is enough.
 */
export type MushroomScenarioFactory = (context: MushroomScenarioContext) => MushroomTimeline | null;

export const MUSHROOM_SCENARIOS: Record<MushroomEmotion, MushroomScenarioFactory | null> = {
  neutral: null,
  staring: staringScenario,
  thinking: thinkingScenario,
  sleep: sleepScenario,
  excited: excitedScenario,
  angry: angryScenario,
  drunk: drunkScenario,
};
