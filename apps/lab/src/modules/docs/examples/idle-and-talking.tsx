'use client';

import { useState } from 'react';

import { Mushroom, type MushroomIdleParts } from 'open-mushroom';

const PARTS: ReadonlyArray<keyof MushroomIdleParts> = ['blink', 'gaze', 'breathe', 'shimmer'];

/* Each idle layer can be switched on its own; `talking` adds mouth chatter on top, e.g. while text streams in. */
export const IdleAndTalkingExample = () => {
  const [idle, setIdle] = useState<MushroomIdleParts>({ blink: true, gaze: true, breathe: true, shimmer: true });
  const [talking, setTalking] = useState(false);

  return (
    <div className="flex flex-col items-center gap-4">
      <Mushroom emotion="excited" size={160} idle={idle} talking={talking} />
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        {PARTS.map((part) => (
          <label key={part} className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={idle[part]}
              onChange={(event) => {
                setIdle({ ...idle, [part]: event.target.checked });
              }}
            />
            {part}
          </label>
        ))}
        <label className="flex items-center gap-1 font-semibold">
          <input
            type="checkbox"
            checked={talking}
            onChange={(event) => {
              setTalking(event.target.checked);
            }}
          />
          talking
        </label>
      </div>
    </div>
  );
};
