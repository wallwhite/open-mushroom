import { type RefObject, useEffect } from 'react';

import type { MushroomEmotion, MushroomHandle, MushroomTimeline } from 'open-mushroom';
import { MUSHROOM_EMOTIONS } from 'open-mushroom/core';

/*
 * Automation surface for visual QA scripts (browser `eval`), exposed while the
 * lab page is mounted. The panels the page does not show any more (hold,
 * transport, mount/unmount, page-wide counters) live on here, headless.
 */
export interface MushroomLabDebugApi {
  setEmotion: (emotion: MushroomEmotion) => void;
  setSize: (size: number) => void;
  setMounted: (mounted: boolean) => void;
  /* Pause every new transition at this share of its duration; `null` stops holding new ones (a held frame stays until `play()` or the next emotion). */
  holdAt: (progress: number | null) => void;
  pause: () => void;
  play: () => void;
  seek: (progress: number) => void;
  timeScale: (value: number) => void;
  showBubble: (text: string) => void;
  snapshot: () => {
    emotion: string;
    target: string;
    transitioning: boolean;
    progress: number | null;
    activeTweens: number;
    ready: boolean;
    active: string[];
  };
  pageActiveTweens: () => number;
}

declare global {
  interface Window {
    __mushroomLab?: MushroomLabDebugApi;
  }
}

interface DebugHandleInput {
  handleRef: RefObject<MushroomHandle | null>;
  setEmotion: (emotion: MushroomEmotion) => void;
  setSize: (size: number) => void;
  setMounted: (mounted: boolean) => void;
  setHoldAt: (progress: number | null) => void;
  showBubble: (text: string) => void;
  pageActiveTweens: () => number;
}

export const useLabDebugHandle = ({
  handleRef,
  setEmotion,
  setSize,
  setMounted,
  setHoldAt,
  showBubble,
  pageActiveTweens,
}: DebugHandleInput): void => {
  useEffect(() => {
    const timeline = (): MushroomTimeline | null => handleRef.current?.getActiveTimeline() ?? null;

    window.__mushroomLab = {
      /* Typed from a console, so checked at run time: an unknown id would crash the rig's effect and unmount the page. */
      setEmotion: (emotion) => {
        if (!(MUSHROOM_EMOTIONS as readonly string[]).includes(emotion))
          throw new Error(`Unknown emotion: ${String(emotion)}`);
        setEmotion(emotion);
      },
      setSize,
      setMounted,
      holdAt: setHoldAt,
      pause: () => {
        timeline()?.pause();
      },
      play: () => {
        timeline()?.play();
      },
      seek: (progress) => {
        timeline()?.progress(progress);
      },
      timeScale: (value) => {
        timeline()?.timeScale(value);
      },
      showBubble,
      snapshot: () => {
        const handle = handleRef.current;
        const snapshot = handle?.getSnapshot();

        return {
          emotion: snapshot?.shown ?? 'unmounted',
          target: snapshot?.target ?? 'unmounted',
          transitioning: snapshot?.transitioning ?? false,
          progress: timeline()?.progress() ?? null,
          activeTweens: handle?.getActiveTweenCount() ?? 0,
          ready: snapshot?.ready ?? false,
          active: handle?.getActiveTargets() ?? [],
        };
      },
      pageActiveTweens,
    };

    return () => {
      delete window.__mushroomLab;
    };
  }, [handleRef, setEmotion, setSize, setMounted, setHoldAt, showBubble, pageActiveTweens]);
};
