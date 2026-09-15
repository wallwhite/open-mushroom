import type { MushroomEmotion } from './mushroom-emotions';

/*
 * Idle life parameters. Base numbers apply to every emotion; a profile tunes
 * them per mood. Times in ms, travel in fractions of the white's box, gaze
 * offsets in travel units (−1…1). Retuned in the lab with the user.
 */
export const MUSHROOM_IDLE_BASE = {
  blink: { intervalMs: { min: 2500, max: 6000 }, closeMs: 110, openMs: 170, doubleChance: 0.1, doublePauseMs: 220 },
  gaze: {
    travel: { rx: 0.16, ry: 0.1 },
    saccadeMs: 90,
    holdMs: { min: 800, max: 3000 },
    returnToCenterChance: 0.3,
    lookAtHoldMs: 1500,
  },
  /*
   * Two rhythms. The head (face + hat) breathes at its own pace — the hat
   * trailing by a share of the cycle — while the body blob keeps a slower
   * swell underneath. Travel is in each layer's own
   * units (face space 1536×1024, hat space 943×442). Every breath draws a
   * fresh length, depth and lag, so the loop never reads as a metronome.
   */
  breathe: {
    cycleJitter: 0.25,
    depthJitter: 0.22,
    /* Share of the cycle spent rising: a quick draw in, a longer let out. */
    inhaleShare: 0.42,
    /* How far into the cycle the hat starts its own move, as a share of it. */
    hatLagShare: 0.16,
    hatLagJitter: 0.25,
    faceScale: 0.026,
    bodyScale: 0.032,
    faceDy: -40,
    hatDy: -26,
  },
  shimmer: { driftMs: { min: 6000, max: 10_000 }, driftUnits: 14, tintRotateDeg: 4 },
} as const;

export interface MushroomIdleProfile {
  /* 0 = eyes never close (sleep), 1 = full blink. */
  blinkDepth: number;
  blinkIntervalScale: number;
  gazeEnabled: boolean;
  /* Where the pupils rest, in travel units. */
  gazeCenter: { dx: number; dy: number };
  /* Full inhale→exhale of the head bob, ms; always well inside one body swell. */
  breatheHeadMs: number;
  /* Full swell of the body blob, ms — slower, and on its own clock. */
  breatheBodyMs: number;
  breatheAmp: number;
  /*
   * Extra scale on the head bob alone, leaving the body's swell where it is:
   * a sleeping mushroom heaves but barely lifts its head.
   */
  breatheHeadLift: number;
}

const CALM: MushroomIdleProfile = {
  blinkDepth: 1,
  blinkIntervalScale: 1,
  gazeEnabled: true,
  gazeCenter: { dx: 0, dy: 0 },
  breatheHeadMs: 2000,
  breatheBodyMs: 4100,
  breatheAmp: 1,
  breatheHeadLift: 1,
};

export const MUSHROOM_IDLE_PROFILES: Record<MushroomEmotion, MushroomIdleProfile> = {
  neutral: CALM,
  staring: { ...CALM, blinkIntervalScale: 1.8, gazeCenter: { dx: 0.7, dy: 0 } },
  thinking: { ...CALM, blinkIntervalScale: 1.2, gazeCenter: { dx: 0.6, dy: -0.5 } },
  sleep: { ...CALM, blinkDepth: 0, gazeEnabled: false, breatheHeadMs: 2500, breatheBodyMs: 5200, breatheHeadLift: 0.5 },
  excited: { ...CALM, blinkIntervalScale: 0.8, breatheHeadMs: 1650, breatheBodyMs: 3400, breatheAmp: 1.15 },
  angry: { ...CALM, blinkDepth: 0.85, breatheHeadMs: 1250, breatheBodyMs: 2600, breatheAmp: 1.4 },
  drunk: {
    ...CALM,
    blinkDepth: 0.5,
    blinkIntervalScale: 1.3,
    gazeEnabled: false,
    breatheHeadMs: 2150,
    breatheBodyMs: 4400,
    breatheAmp: 1.1,
  },
};
