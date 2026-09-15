/*
 * Per-emotion scenario numbers (ms, degrees, scale factors, face-space units).
 * Scenarios start once the morph is this far along, so parts that fade in are
 * already visible when their motion begins.
 */
export const MUSHROOM_SCENARIO = {
  startAtMorphProgress: 0.6,
  thinking: { handSwingDeg: 5, swingMs: 1100 },
  sleep: { droolScaleY: 1.25, droolMs: 2400 },
  drunk: { swayDeg: 3, swayMs: 2600, driftX: 4, driftMs: 3100, mouthSkewDeg: 3, mouthMs: 2200 },
  angry: {
    shakeX: 3,
    shakeMs: 70,
    shakes: 3,
    browPulse: 1.1,
    browPulseMs: 120,
    browPeriodMs: { min: 3000, max: 5000 },
    corePulse: 1.06,
    coreMs: 1200,
  },
  excited: {
    popScale: 1.08,
    popMs: 700,
    hatBounceY: -10,
    hatMs: 500,
    hatDelayMs: 80,
    pupilScale: 1.15,
    pupilMs: 300,
    haloScale: 1.06,
    haloMs: 400,
  },
  staring: { tiltDeg: -2, shiftX: 3, settleMs: 450 },
  talking: { open: 1.06, closed: 0.94, stepMs: 90, pauseMs: { min: 200, max: 400 } },
} as const;
