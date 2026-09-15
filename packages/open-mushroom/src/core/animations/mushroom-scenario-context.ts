import type { MushroomEmotion } from '../constants/mushroom-emotions';
import { MUSHROOM_IDLE_PROFILES, type MushroomIdleProfile } from '../constants/mushroom-idle-profiles';
import type { BodyLayerKey } from '../constants/mushroom-layout';
import { MUSHROOM_FRAMES } from '../constants/mushroom-manifest';
import type { MushroomEyeSide, MushroomSlotId } from '../constants/mushroom-slots';
import type { Rng } from '../helpers/idle-scheduler';
import type { MushroomEmotionFrame, MushroomPoint } from '../types/mushroom-manifest.types';
import type { MushroomRig } from './mushroom-rig-context';

/*
 * Everything a scenario or idle loop needs, resolved once per rig: scoped DOM
 * lookups (never `document`), the current emotion's frame and idle profile,
 * the random source, and the pivot helper (face-space anchor → svgOrigin).
 */
export interface MushroomScenarioContext {
  rig: MushroomRig;
  rng: Rng;
  emotion: MushroomEmotion;
  frame: MushroomEmotionFrame;
  profile: MushroomIdleProfile;
  face: SVGGElement | null;
  faceScenario: SVGGElement | null;
  body: SVGGElement | null;
  hat: SVGGElement | null;
  hatScenario: SVGGElement | null;
  eye: (side: MushroomEyeSide) => SVGGElement | null;
  pupil: (side: MushroomEyeSide) => SVGGElement | null;
  slot: (slot: MushroomSlotId) => SVGPathElement | null;
  ellipse: (key: BodyLayerKey) => SVGEllipseElement | null;
  gradient: (key: BodyLayerKey) => SVGRadialGradientElement | null;
  /* GSAP `transformOrigin` for an SVG element: px measured from its own bbox corner, in its local units. */
  originFor: (element: SVGGraphicsElement, point: MushroomPoint) => string;
  seconds: (ms: number) => number;
  /* Re-points `emotion`, `frame` and `profile` at a new emotion (same DOM). */
  setEmotion: (emotion: MushroomEmotion) => void;
}

const MS_PER_SECOND = 1000;

export const createScenarioContext = (
  rig: MushroomRig,
  emotion: MushroomEmotion,
  rng: Rng,
): MushroomScenarioContext => {
  const find = <T extends Element>(selector: string): T | null => rig.root.querySelector<T>(selector);
  const context: MushroomScenarioContext = {
    rig,
    rng,
    emotion,
    frame: MUSHROOM_FRAMES[emotion],
    profile: MUSHROOM_IDLE_PROFILES[emotion],
    face: find<SVGGElement>('[data-mushroom-anim="face"]'),
    faceScenario: find<SVGGElement>('[data-mushroom-anim="face-scenario"]'),
    body: find<SVGGElement>('[data-mushroom-anim="body"]'),
    hat: find<SVGGElement>('[data-mushroom-anim="hat"]'),
    hatScenario: find<SVGGElement>('[data-mushroom-anim="hat-scenario"]'),
    eye: (side) => find<SVGGElement>(`[data-mushroom-eye="${side}"]`),
    pupil: (side) => find<SVGGElement>(`[data-mushroom-pupil="${side}"]`),
    slot: (slot) => find<SVGPathElement>(`[data-mushroom-slot="${slot}"]`),
    ellipse: (key) => find<SVGEllipseElement>(`[data-mushroom-body="${key}"]`),
    gradient: (key) => find<SVGRadialGradientElement>(`[data-mushroom-gradient="${key}"]`),
    originFor: (element, point) => {
      const box = element.getBBox();

      return `${point.x - box.x}px ${point.y - box.y}px`;
    },
    seconds: (ms) => ms / MS_PER_SECOND,
    setEmotion: (next) => {
      context.emotion = next;
      context.frame = MUSHROOM_FRAMES[next];
      context.profile = MUSHROOM_IDLE_PROFILES[next];
    },
  };

  return context;
};

export const eyeAnchor = (frame: MushroomEmotionFrame, side: MushroomEyeSide): MushroomPoint =>
  side === 'left' ? frame.anchors.eyeLeft : frame.anchors.eyeRight;
