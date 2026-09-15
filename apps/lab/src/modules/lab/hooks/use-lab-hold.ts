import { type RefObject, useEffect } from 'react';

import type { MushroomHandle, MushroomTimeline } from 'open-mushroom';

const noop = (): void => undefined;

/*
 * Hold mode for visual QA: while `holdAt` is set, every new emotion
 * transition is paused at that share of its duration so the frame can be
 * captured. A frame watcher spots each new timeline; the rig keeps owning it.
 */
export const useLabHold = (handleRef: RefObject<MushroomHandle | null>, holdAt: number | null): void => {
  useEffect(() => {
    if (holdAt === null) return noop;
    let seen: MushroomTimeline | null = null;
    let frame = 0;
    const watch = (): void => {
      const timeline = handleRef.current?.getActiveTimeline() ?? null;

      if (timeline && timeline !== seen) {
        seen = timeline;
        timeline.pause(holdAt * timeline.duration());
      }
      frame = requestAnimationFrame(watch);
    };

    frame = requestAnimationFrame(watch);

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [handleRef, holdAt]);
};
