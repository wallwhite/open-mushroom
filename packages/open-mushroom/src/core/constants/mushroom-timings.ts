/* Durations in ms; the rig converts to seconds for GSAP. */
export const MUSHROOM_TIMINGS = {
  morphMs: 450,
  fadeInMs: 200,
  fadeInDelayMs: 120,
  fadeOutMs: 180,
  paletteMs: 600,
  /* An interrupted transition is played out this much faster before the next one starts. */
  interruptTimeScale: 4,
  morphEase: 'power2.inOut',
} as const;
