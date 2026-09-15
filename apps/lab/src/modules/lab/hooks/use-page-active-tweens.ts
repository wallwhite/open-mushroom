import { useCallback, useEffect, useRef } from 'react';

import { ensureMushroomGsap, type MushroomGsap } from 'open-mushroom/core';

/*
 * Page-wide count of live GSAP animations: the number that must drop to zero
 * after a rig unmounts. Returned as a getter so the debug handle reads it on
 * demand instead of the page re-rendering on a timer.
 */
export const usePageActiveTweens = (): (() => number) => {
  const gsapRef = useRef<MushroomGsap | null>(null);

  useEffect(() => {
    let cancelled = false;

    ensureMushroomGsap()
      .then((loaded) => {
        if (!cancelled) gsapRef.current = loaded;
      })
      .catch(() => {
        /* Without GSAP there is nothing to count. */
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return useCallback(() => {
    const gsap = gsapRef.current;

    if (!gsap) return 0;

    return gsap.globalTimeline.getChildren(true, true, true).filter((animation) => animation.isActive()).length;
  }, []);
};
