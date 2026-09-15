import type { MushroomGsap, MushroomTimeline } from '../core/animations/mushroom-gsap';

/*
 * The arrival and the departure, which are not each other's reverse.
 *
 * Coming in, the card swings up around its own tail and overshoots before it
 * settles; that is the whole character of the thing, and `back.out` gives the
 * overshoot for free where a css curve had to fake it. The swing outlasts the
 * fade on purpose: the card is fully readable while it is still righting
 * itself. Going out it only fades and blurs; the tilt is reset afterwards, off
 * screen, so nobody watches it rotate away.
 */
export const BUBBLE_MOTION = {
  tiltDeg: 14,
  enterBlurPx: 4,
  exitBlurPx: 6,
  fadeInSeconds: 0.3,
  swingSeconds: 0.66,
  /* How far past level the swing carries before it comes back. */
  overshoot: 2.2,
  fadeOutSeconds: 0.26,
} as const;

export const buildBubbleTimeline = (gsap: MushroomGsap, element: HTMLElement, visible: boolean): MushroomTimeline => {
  const timeline = gsap.timeline();

  if (visible) {
    return timeline
      .fromTo(
        element,
        { opacity: 0, filter: `blur(${BUBBLE_MOTION.enterBlurPx}px)` },
        { opacity: 1, filter: 'blur(0px)', duration: BUBBLE_MOTION.fadeInSeconds, ease: 'power2.out' },
      )
      .fromTo(
        element,
        { rotation: -BUBBLE_MOTION.tiltDeg },
        {
          rotation: 0,
          duration: BUBBLE_MOTION.swingSeconds,
          ease: `back.out(${BUBBLE_MOTION.overshoot})`,
        },
        0,
      );
  }

  return timeline
    .to(element, {
      opacity: 0,
      filter: `blur(${BUBBLE_MOTION.exitBlurPx}px)`,
      duration: BUBBLE_MOTION.fadeOutSeconds,
      ease: 'power2.in',
    })
    .set(element, { rotation: -BUBBLE_MOTION.tiltDeg });
};

/* Reduced motion: the card is simply there or not, level and sharp. */
export const buildInstantBubbleTimeline = (
  gsap: MushroomGsap,
  element: HTMLElement,
  visible: boolean,
): MushroomTimeline => gsap.timeline().set(element, { opacity: visible ? 1 : 0, rotation: 0, filter: 'none' });
