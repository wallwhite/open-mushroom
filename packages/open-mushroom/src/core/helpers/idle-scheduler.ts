import { MUSHROOM_IDLE_BASE, type MushroomIdleProfile } from '../constants/mushroom-idle-profiles';

/*
 * Pure decisions of the idle life (when to blink, where to look next). The
 * random source is injected so tests are deterministic and the lab can replay.
 */
export type Rng = () => number;

export interface GazeTarget {
  /* Travel units, −1…1 around the profile's gaze centre. */
  dx: number;
  dy: number;
  holdMs: number;
}

export interface Range {
  min: number;
  max: number;
}

const FULL_TURN = Math.PI + Math.PI;
const UNIT = 1;

export const uniform = (rng: Rng, { min, max }: Range): number => min + rng() * (max - min);

const clampUnit = (value: number): number => Math.max(-UNIT, Math.min(UNIT, value));

export const nextBlinkDelayMs = (rng: Rng, profile: MushroomIdleProfile): number =>
  uniform(rng, MUSHROOM_IDLE_BASE.blink.intervalMs) * profile.blinkIntervalScale;

export const shouldDoubleBlink = (rng: Rng): boolean => rng() < MUSHROOM_IDLE_BASE.blink.doubleChance;

/* Next resting point of the pupils: a uniform point in the unit ellipse around the gaze centre, or the centre itself. */
export const nextSaccade = (rng: Rng, profile: MushroomIdleProfile): GazeTarget => {
  const holdMs = uniform(rng, MUSHROOM_IDLE_BASE.gaze.holdMs);
  const { dx, dy } = profile.gazeCenter;

  if (rng() < MUSHROOM_IDLE_BASE.gaze.returnToCenterChance) return { dx, dy, holdMs };
  const angle = rng() * FULL_TURN;
  const radius = Math.sqrt(rng());

  return { dx: clampUnit(dx + radius * Math.cos(angle)), dy: clampUnit(dy + radius * Math.sin(angle)), holdMs };
};

/* Travel units → face-space pixels for a white of the given box. */
export const gazeOffset = (
  target: { dx: number; dy: number },
  white: { width: number; height: number },
): { x: number; y: number } => ({
  x: target.dx * MUSHROOM_IDLE_BASE.gaze.travel.rx * white.width,
  y: target.dy * MUSHROOM_IDLE_BASE.gaze.travel.ry * white.height,
});

const around = (rng: Rng, value: number, jitter: number): number =>
  value * uniform(rng, { min: 1 - jitter, max: 1 + jitter });

/* Each breath gets its own length so the cycle never reads as a metronome. */
export const nextBreathMs = (rng: Rng, cycleMs: number): number =>
  around(rng, cycleMs, MUSHROOM_IDLE_BASE.breathe.cycleJitter);

/* …and its own depth, as a multiplier on the profile's travel: some breaths are deeper than others. */
export const nextBreathDepth = (rng: Rng): number => around(rng, 1, MUSHROOM_IDLE_BASE.breathe.depthJitter);

/* …and its own hat delay, in ms, measured as a share of that breath. */
export const nextHatLagMs = (rng: Rng, breathMs: number): number => {
  const { hatLagShare, hatLagJitter } = MUSHROOM_IDLE_BASE.breathe;

  return around(rng, breathMs * hatLagShare, hatLagJitter);
};
