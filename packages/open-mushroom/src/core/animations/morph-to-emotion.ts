import type { MushroomEmotion } from '../constants/mushroom-emotions';
import type { BodyLayerKey } from '../constants/mushroom-layout';
import type { MorphTuningTable } from '../constants/mushroom-morph-tuning';
import type { MushroomPalette } from '../constants/mushroom-palettes';
import { MUSHROOM_SCENARIO } from '../constants/mushroom-scenario-timings';
import { MUSHROOM_EXTRA_SLOTS, type MushroomSlotId } from '../constants/mushroom-slots';
import { MUSHROOM_TIMINGS } from '../constants/mushroom-timings';
import { pinnedShapeIndex } from '../helpers/morph-shape-index';
import { tuningFor } from '../helpers/morph-tuning-key';
import type { TransitionOp } from '../helpers/mushroom-transition-plan';
import type { MushroomTimeline } from './mushroom-gsap';
import type { MushroomRig } from './mushroom-rig-context';

export interface EmotionTransitionInput {
  rig: MushroomRig;
  ops: TransitionOp[];
  from: MushroomEmotion;
  to: MushroomEmotion;
  palette: MushroomPalette;
  tuning: MorphTuningTable;
  /* Reduced motion, or catching up after GSAP loaded: jump to the target frame. */
  instant: boolean;
  onComplete: () => void;
  /* Fired part-way through the morph, when appearing parts are visible enough for their scenario to start. */
  onScenarioPoint?: () => void;
}

const MS_PER_SECOND = 1000;

const slotElement = (root: SVGSVGElement, slot: string): SVGPathElement | null =>
  root.querySelector<SVGPathElement>(`[data-mushroom-slot="${slot}"]`);

/*
 * The hand and the drool are objects of their own: they may come and go quickly.
 * Every other part is a piece of one line drawing — a connector between the brow
 * and the nose, a crease, a mouth corner — so it has to dissolve over the whole
 * morph, or the ink breaks while the parts around it are still travelling.
 */
const isExtra = (slot: MushroomSlotId): boolean => (MUSHROOM_EXTRA_SLOTS as readonly MushroomSlotId[]).includes(slot);

/*
 * One timeline per emotion change: every present→present slot morphs, parts
 * that appear get their shape then fade in, parts that vanish fade out, and
 * the body gradient stops glide to the new palette. All at time 0, so the
 * face changes as a whole rather than feature by feature.
 */
export const buildEmotionTransition = (input: EmotionTransitionInput): MushroomTimeline =>
  input.rig.context.add(() => {
    const { rig, ops, from, to, palette, tuning, instant, onComplete, onScenarioPoint } = input;
    const seconds = (ms: number): number => (instant ? 0 : ms / MS_PER_SECOND);
    const timeline = rig.gsap.timeline({ defaults: { ease: MUSHROOM_TIMINGS.morphEase }, onComplete });

    const addMorph = (element: SVGPathElement, op: Extract<TransitionOp, { kind: 'morph' }>): void => {
      const morphSVG = {
        shape: op.to,
        shapeIndex: pinnedShapeIndex(element.getAttribute('d'), op.to),
        ...tuningFor(tuning, from, to, op.slot),
      };

      timeline.to(element, { duration: seconds(MUSHROOM_TIMINGS.morphMs), morphSVG }, 0);
    };
    const addFadeIn = (element: SVGPathElement, op: Extract<TransitionOp, { kind: 'fade-in' }>): void => {
      const extra = isExtra(op.slot);

      timeline.set(element, { attr: { d: op.to } }, 0);
      timeline.to(
        element,
        { opacity: 1, duration: seconds(extra ? MUSHROOM_TIMINGS.fadeInMs : MUSHROOM_TIMINGS.morphMs) },
        seconds(extra ? MUSHROOM_TIMINGS.fadeInDelayMs : 0),
      );
    };

    for (const op of ops) {
      const element = slotElement(rig.root, op.slot);

      if (!element || op.kind === 'noop') continue;
      if (op.kind === 'morph') addMorph(element, op);
      else if (op.kind === 'fade-in') addFadeIn(element, op);
      else {
        const duration = isExtra(op.slot) ? MUSHROOM_TIMINGS.fadeOutMs : MUSHROOM_TIMINGS.morphMs;

        timeline.to(element, { opacity: 0, duration: seconds(duration) }, 0);
      }
    }
    for (const stop of rig.root.querySelectorAll<SVGStopElement>('[data-mushroom-stop]')) {
      const layer = stop.dataset.mushroomStop as BodyLayerKey | undefined;

      if (layer)
        timeline.to(stop, { attr: { 'stop-color': palette[layer] }, duration: seconds(MUSHROOM_TIMINGS.paletteMs) }, 0);
    }

    if (onScenarioPoint) {
      timeline.call(onScenarioPoint, [], seconds(MUSHROOM_TIMINGS.morphMs) * MUSHROOM_SCENARIO.startAtMorphProgress);
    }

    return rig.track(timeline);
  });
