'use client';

import { useState } from 'react';

import { Mushroom, type MushroomEmotion } from 'open-mushroom';
import { MUSHROOM_EMOTIONS } from 'open-mushroom/core';

/* Change the prop and the face morphs there; a new choice mid-morph plays the running morph out quickly, then routes on. */
export const EmotionSwitcherExample = () => {
  const [emotion, setEmotion] = useState<MushroomEmotion>('neutral');

  return (
    <div className="flex flex-col items-center gap-4">
      <Mushroom emotion={emotion} size={160} />
      <div className="flex flex-wrap justify-center gap-2">
        {MUSHROOM_EMOTIONS.map((candidate) => (
          <button
            key={candidate}
            type="button"
            aria-pressed={candidate === emotion}
            className="rounded-full border px-3 py-1 text-sm aria-pressed:bg-black aria-pressed:text-white"
            onClick={() => {
              setEmotion(candidate);
            }}
          >
            {candidate}
          </button>
        ))}
      </div>
    </div>
  );
};
