import { describe, expect, it } from 'vitest';

import { MUSHROOM_EMOTIONS } from '../constants/mushroom-emotions';
import { MUSHROOM_IDLE_BASE, MUSHROOM_IDLE_PROFILES } from '../constants/mushroom-idle-profiles';
import {
  gazeOffset,
  nextBlinkDelayMs,
  nextBreathDepth,
  nextBreathMs,
  nextHatLagMs,
  nextSaccade,
  shouldDoubleBlink,
} from './idle-scheduler';

const lcg = (seed: number) => {
  let state = seed;

  return () => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;

    return state / 4_294_967_296;
  };
};

const SAMPLES = 10_000;

describe('idle scheduler', () => {
  it('keeps blink delays inside the base range scaled by the profile', () => {
    const rng = lcg(1);
    const { min, max } = MUSHROOM_IDLE_BASE.blink.intervalMs;
    const scale = MUSHROOM_IDLE_PROFILES.staring.blinkIntervalScale;

    for (let i = 0; i < SAMPLES; i += 1) {
      const delay = nextBlinkDelayMs(rng, MUSHROOM_IDLE_PROFILES.staring);

      expect(delay).toBeGreaterThanOrEqual(min * scale);
      expect(delay).toBeLessThanOrEqual(max * scale);
    }
  });

  it('double-blinks about one time in ten', () => {
    const rng = lcg(7);
    let doubles = 0;

    for (let i = 0; i < SAMPLES; i += 1) if (shouldDoubleBlink(rng)) doubles += 1;
    expect(doubles / SAMPLES).toBeGreaterThan(0.08);
    expect(doubles / SAMPLES).toBeLessThan(0.12);
  });

  it('keeps saccades inside the travel ellipse and returns to centre sometimes', () => {
    const rng = lcg(42);
    const profile = MUSHROOM_IDLE_PROFILES.neutral;
    let centred = 0;

    for (let i = 0; i < SAMPLES; i += 1) {
      const target = nextSaccade(rng, profile);

      expect(Math.abs(target.dx)).toBeLessThanOrEqual(1);
      expect(Math.abs(target.dy)).toBeLessThanOrEqual(1);
      expect(target.holdMs).toBeGreaterThanOrEqual(MUSHROOM_IDLE_BASE.gaze.holdMs.min);
      expect(target.holdMs).toBeLessThanOrEqual(MUSHROOM_IDLE_BASE.gaze.holdMs.max);
      if (target.dx === 0 && target.dy === 0) centred += 1;
    }
    expect(centred / SAMPLES).toBeGreaterThan(0.25);
    expect(centred / SAMPLES).toBeLessThan(0.35);
  });

  it('shifts the staring gaze to the right', () => {
    const rng = lcg(3);
    const mean =
      Array.from({ length: SAMPLES }, () => nextSaccade(rng, MUSHROOM_IDLE_PROFILES.staring).dx).reduce(
        (a, b) => a + b,
      ) / SAMPLES;

    expect(mean).toBeGreaterThan(0.5);
  });

  it('converts travel units to a fraction of the white box', () => {
    expect(gazeOffset({ dx: 1, dy: -1 }, { width: 200, height: 100 })).toEqual({ x: 32, y: -10 });
  });

  it('jitters each breath around the cycle it was given', () => {
    const rng = lcg(9);
    const cycle = MUSHROOM_IDLE_PROFILES.sleep.breatheBodyMs;
    const { cycleJitter } = MUSHROOM_IDLE_BASE.breathe;

    for (let i = 0; i < SAMPLES; i += 1) {
      const breath = nextBreathMs(rng, cycle);

      expect(breath).toBeGreaterThanOrEqual(cycle * (1 - cycleJitter));
      expect(breath).toBeLessThanOrEqual(cycle * (1 + cycleJitter));
    }
  });

  /*
   * The two clocks only read as one creature while the head keeps finishing a
   * breath inside a single body swell — jitter on both included, or the blob
   * would sometimes lead the face and the bob would look detached.
   */
  it('finishes every head breath inside one body swell', () => {
    const { cycleJitter } = MUSHROOM_IDLE_BASE.breathe;

    for (const emotion of MUSHROOM_EMOTIONS) {
      const { breatheHeadMs, breatheBodyMs } = MUSHROOM_IDLE_PROFILES[emotion];

      expect(breatheHeadMs * (1 + cycleJitter)).toBeLessThan(breatheBodyMs * (1 - cycleJitter));
    }
  });

  it('varies the depth of a breath around the profile travel', () => {
    const rng = lcg(13);
    const { depthJitter } = MUSHROOM_IDLE_BASE.breathe;
    const depths = Array.from({ length: SAMPLES }, () => nextBreathDepth(rng));

    for (const depth of depths) {
      expect(depth).toBeGreaterThanOrEqual(1 - depthJitter);
      expect(depth).toBeLessThanOrEqual(1 + depthJitter);
    }
    expect(depths.reduce((a, b) => a + b) / SAMPLES).toBeCloseTo(1, 1);
  });

  /* The hat has to start after the face and still leave room to travel inside the same breath. */
  it('delays the hat by part of the breath it belongs to', () => {
    const rng = lcg(17);
    const breath = 800;

    for (let i = 0; i < SAMPLES; i += 1) {
      const lag = nextHatLagMs(rng, breath);

      expect(lag).toBeGreaterThan(0);
      expect(lag).toBeLessThan(breath / 2);
    }
  });
});
