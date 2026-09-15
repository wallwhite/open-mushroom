import type { MushroomTimeline } from '../animations/mushroom-gsap';
import type { MushroomEmotion } from '../constants/mushroom-emotions';

/*
 * Imperative surface of <Mushroom>. State (emotion, talking, idle) is props-only;
 * the handle exists for one-shot actions and for diagnostics in the lab.
 */
export interface MushroomRigSnapshot {
  /* Emotion the SVG shows right now (the source of the next morph). */
  shown: MushroomEmotion;
  /* Emotion requested through props; equals `shown` once every morph has finished. */
  target: MushroomEmotion;
  transitioning: boolean;
  /* GSAP has loaded and the rig is attached to the SVG. */
  ready: boolean;
}

export interface MushroomHandle {
  /* One extra blink on top of the idle life. */
  blink: () => void;
  /* Points the gaze; dx/dy are normalised offsets in −1..1 of the eye's travel. */
  lookAt: (dx: number, dy: number) => void;
  getSnapshot: () => MushroomRigSnapshot;
  /**
   * Live GSAP animations owned by this rig.
   *
   * @remarks Diagnostics for the lab and visual QA; not covered by semver.
   */
  getActiveTweenCount: () => number;
  /**
   * What the live animations are touching, one description per animation.
   *
   * @remarks Diagnostics; not covered by semver.
   */
  getActiveTargets: () => string[];
  /**
   * The emotion transition currently playing, if any.
   *
   * @remarks Diagnostics; not covered by semver.
   */
  getActiveTimeline: () => MushroomTimeline | null;
}
