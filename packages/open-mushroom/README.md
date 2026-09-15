# open-mushroom

Mushroom Gennadiyovych is a living SVG mascot for React: seven emotions that morph into each other, idle life
(blinks, gaze, breathing, shimmer), talking, and a speech bubble. Server-rendered as plain SVG; GSAP arrives
after mount.

## Install

```bash
npm install open-mushroom gsap
```

React 19 and GSAP 3.13+ are peer dependencies. GSAP (including MorphSVGPlugin) ships under the
[GSAP Standard License](https://gsap.com/community/standard-license/), free of charge.

## Use

```tsx
import { useRef, useState } from 'react';
import { Mushroom, MushroomSpeechBubble, type MushroomHandle } from 'open-mushroom';
import 'open-mushroom/styles.css';

export const Hero = () => {
  const ref = useRef<MushroomHandle>(null);
  const [emotion, setEmotion] = useState<'neutral' | 'excited'>('neutral');

  return (
    <div onMouseEnter={() => setEmotion('excited')} onMouseLeave={() => setEmotion('neutral')}>
      <MushroomSpeechBubble text="Hello there!" visible={emotion === 'excited'} speaker="Mushroom" />
      <Mushroom ref={ref} emotion={emotion} size={240} />
      <button type="button" onClick={() => ref.current?.blink()}>
        Blink
      </button>
    </div>
  );
};
```

- `emotion`: `neutral | staring | thinking | sleep | excited | angry | drunk`
- `size`: CSS pixels; small sizes get a thicker ink stroke automatically
- `talking`: mouth chatter while text streams in
- `idle`: `true` (default), `false` for a still picture, or `{ blink, gaze, breathe, shimmer }`
- `ref`: `blink()`, `lookAt(dx, dy)`, `getSnapshot()`; diagnostics helpers are not covered by semver

Theme through CSS custom properties on any ancestor: `--om-ink`, `--om-white`, `--om-bubble-bg`, `--om-bubble-fg`,
`--om-bubble-muted`, `--om-bubble-width`, `--om-bubble-shadow`. Hang the bubble beside the body with
`MUSHROOM_BUBBLE_ANCHOR` from `open-mushroom/core` (CSS `right`/`bottom` inside a `position: relative` wrapper around
the character).

## Two entries

Components come from `open-mushroom` (a client module). Values, such as `MUSHROOM_EMOTIONS`, `MUSHROOM_FRAMES` or
`faceToViewBox`, come from `open-mushroom/core`, which is framework-free and safe to import from React Server
Components.

```ts
import { MUSHROOM_EMOTIONS } from 'open-mushroom/core';
```

Documentation and a playground live in Mushroom Lab: https://github.com/wallwhite/open-mushroom

## Licenses

Code is MIT. The character artwork (source exports and the generated skeleton manifests inside the package) is
CC BY 4.0, attribution "Mushroom character by Yaroslav Romanenko"; see `LICENSE-ASSETS` in the package.
