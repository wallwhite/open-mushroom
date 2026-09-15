import { type RefObject, useEffect, useMemo, useRef } from 'react';

import { ALL_IDLE_PARTS, type MushroomIdleParts, NO_IDLE_PARTS } from '../core/animations/idle/idle-controller';
import { ensureMushroomGsap } from '../core/animations/mushroom-gsap';
import { createMushroomRuntime, type MushroomRuntime } from '../core/animations/mushroom-runtime';
import type { MushroomEmotion } from '../core/constants/mushroom-emotions';
import type { MushroomHandle } from '../core/types/mushroom-handle';

/*
 * React side of the rig: one runtime per mounted <Mushroom>, GSAP loaded lazily
 * on mount, props forwarded as they change, everything torn down on unmount
 * (StrictMode's double mount included).
 */
interface UseMushroomRigInput {
  emotion: MushroomEmotion;
  talking: boolean;
  idle: boolean | MushroomIdleParts;
  svgRef: RefObject<SVGSVGElement | null>;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const noop = (): void => undefined;

const normalizeIdle = (idle: boolean | MushroomIdleParts): MushroomIdleParts => {
  if (idle === true) return ALL_IDLE_PARTS;
  if (idle === false) return NO_IDLE_PARTS;

  return idle;
};

export const useMushroomRig = ({ emotion, talking, idle, svgRef }: UseMushroomRigInput): MushroomHandle => {
  const idleParts = normalizeIdle(idle);
  const idleKey = `${idleParts.blink}${idleParts.gaze}${idleParts.breathe}${idleParts.shimmer}`;
  /* Created once per mounted component; a lazy ref keeps the factory off the render path after the first pass. */
  const runtimeRef = useRef<MushroomRuntime | null>(null);

  runtimeRef.current ??= createMushroomRuntime({ emotion, talking, idle: idleParts });
  const runtime = runtimeRef.current;

  useEffect(() => {
    const svg = svgRef.current;

    if (!svg) return noop;
    const media = window.matchMedia(REDUCED_MOTION_QUERY);
    const syncMedia = (): void => {
      runtime.setReducedMotion(media.matches);
    };
    let cancelled = false;

    syncMedia();
    media.addEventListener('change', syncMedia);
    ensureMushroomGsap()
      .then((gsapInstance) => {
        if (!cancelled) runtime.attach(gsapInstance, svg);
      })
      .catch((error: unknown) => {
        console.error('open-mushroom: gsap failed to load', error);
      });

    return () => {
      cancelled = true;
      media.removeEventListener('change', syncMedia);
      runtime.detach();
    };
  }, [runtime, svgRef]);

  useEffect(() => {
    runtime.setTarget(emotion);
  }, [emotion, runtime]);

  useEffect(() => {
    runtime.setTalking(talking);
  }, [talking, runtime]);

  useEffect(() => {
    runtime.setIdle(normalizeIdle(idle));
    // The key captures the four flags; the object identity may change every render.
  }, [idleKey, runtime]);

  return useMemo<MushroomHandle>(
    () => ({
      blink: runtime.blink,
      lookAt: runtime.lookAt,
      getActiveTweenCount: runtime.getActiveTweenCount,
      getActiveTargets: runtime.getActiveTargets,
      getActiveTimeline: runtime.getActiveTimeline,
      getSnapshot: runtime.getSnapshot,
    }),
    [runtime],
  );
};
