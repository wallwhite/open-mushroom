'use client';

import { type PointerEvent, useRef } from 'react';

import { Mushroom, type MushroomHandle } from 'open-mushroom';

/* A ratio across the box (0..1) becomes an offset across the eye's travel (-1..1). */
const TRAVEL_SPAN = 2;
const toTravel = (ratio: number): number => ratio * TRAVEL_SPAN - 1;

/* The handle is for one-shot actions: point the gaze at the pointer, blink on demand. */
export const LookAtPointerExample = () => {
  const ref = useRef<MushroomHandle>(null);

  const follow = (event: PointerEvent<HTMLDivElement>): void => {
    const box = event.currentTarget.getBoundingClientRect();
    const dx = toTravel((event.clientX - box.left) / box.width);
    const dy = toTravel((event.clientY - box.top) / box.height);

    ref.current?.lookAt(dx, dy);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="rounded-3xl border border-dashed p-6"
        onPointerMove={follow}
        onPointerLeave={() => {
          ref.current?.lookAt(0, 0);
        }}
      >
        <Mushroom ref={ref} emotion="staring" size={160} />
      </div>
      <button
        type="button"
        className="rounded-full border px-3 py-1 text-sm"
        onClick={() => {
          ref.current?.blink();
        }}
      >
        Blink
      </button>
    </div>
  );
};
