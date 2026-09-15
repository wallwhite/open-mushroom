import { useRef } from 'react';

import { Mushroom, type MushroomHandle, MushroomSpeechBubble } from 'open-mushroom';
import { MUSHROOM_EMOTIONS, type MushroomGsap } from 'open-mushroom/core';

/*
 * A consumer typechecked with `skipLibCheck` disabled: proves the published
 * declarations stand on their own (no ambient GSAP namespace, no zod types).
 */
export const Consumer = () => {
  const ref = useRef<MushroomHandle>(null);
  const timeline: ReturnType<MushroomGsap['timeline']> | null = ref.current?.getActiveTimeline() ?? null;

  return (
    <>
      <Mushroom ref={ref} emotion={MUSHROOM_EMOTIONS[0]} size={96} />
      <MushroomSpeechBubble visible text={timeline === null ? 'still' : 'moving'} speaker="Mushroom" />
    </>
  );
};
