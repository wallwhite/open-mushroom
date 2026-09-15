'use client';

import { type CSSProperties, useState } from 'react';

import { Mushroom, MushroomSpeechBubble } from 'open-mushroom';
import { MUSHROOM_BUBBLE_ANCHOR } from 'open-mushroom/core';

const LINES = ['Water first. Then we discuss the cookies.', 'The fridge light saw everything.'];

/* The card hangs beside the body on the package's anchor (its tail reaches the face); on phones it moves above the head. */
const ANCHOR = {
  '--bubble-right': MUSHROOM_BUBBLE_ANCHOR.right,
  '--bubble-bottom': MUSHROOM_BUBBLE_ANCHOR.bottom,
} as CSSProperties;

export const SpeechBubbleExample = () => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  return (
    <div className="flex flex-col items-center gap-4 pt-20 sm:pt-0">
      <div className="relative sm:ml-[17rem]">
        <div
          className="absolute right-1/2 bottom-full max-sm:[--om-bubble-width:min(17rem,calc(50vw_-_1rem))] sm:right-(--bubble-right) sm:bottom-(--bubble-bottom)"
          style={ANCHOR}
        >
          <MushroomSpeechBubble
            text={LINES[index] ?? ''}
            visible={visible}
            speaker="Mushroom"
            onDismiss={() => {
              setVisible(false);
            }}
          />
        </div>
        <Mushroom emotion={visible ? 'excited' : 'neutral'} size={160} />
      </div>
      <button
        type="button"
        className="rounded-full border px-3 py-1 text-sm"
        onClick={() => {
          setIndex((previous) => (previous + 1) % LINES.length);
          setVisible(true);
        }}
      >
        Say something
      </button>
    </div>
  );
};
