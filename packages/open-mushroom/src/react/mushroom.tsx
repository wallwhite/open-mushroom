import { type CSSProperties, type Ref, useId, useImperativeHandle, useMemo, useRef } from 'react';

import type { MushroomIdleParts } from '../core/animations/idle/idle-controller';
import type { MushroomEmotion } from '../core/constants/mushroom-emotions';
import { MUSHROOM_VIEWBOX } from '../core/constants/mushroom-layout';
import { MUSHROOM_FRAMES } from '../core/constants/mushroom-manifest';
import { MUSHROOM_PALETTES } from '../core/constants/mushroom-palettes';
import { strokeBoostForSize } from '../core/helpers/stroke-boost';
import type { MushroomHandle } from '../core/types/mushroom-handle';
import { MushroomBody } from './mushroom-body';
import { MushroomFace } from './mushroom-face';
import { MushroomHat } from './mushroom-hat';
import { mushroomIds } from './mushroom-ids';
import { MUSHROOM_ROOT_STYLE } from './mushroom-paint-styles';
import { useMushroomRig } from './use-mushroom-rig';

export interface MushroomProps {
  emotion: MushroomEmotion;
  /* CSS pixels; also picks the ink stroke boost. */
  size: number;
  /* Mouth chatter while text streams in (idle layer). */
  talking?: boolean;
  /* Blink / gaze / breathe / shimmer; `false` for thumbnails, an object to pick layers. */
  idle?: boolean | MushroomIdleParts;
  className?: string;
  /* Merged over the root's own display/overflow; `--om-ink` and `--om-white` here or on any ancestor theme the face. */
  style?: CSSProperties;
  ref?: Ref<MushroomHandle>;
}

/*
 * Машрум Геннадійович: hat → body blob → face skeleton in one 640×640 SVG.
 * Server-renders the initial emotion; after mount the GSAP rig morphs between
 * emotions. State comes in through props only; the ref exposes one-shot
 * actions and diagnostics.
 */
export const Mushroom = ({ emotion, size, talking = false, idle = true, className, style, ref }: MushroomProps) => {
  const reactId = useId();
  const initialEmotion = useRef(emotion).current;
  const svgRef = useRef<SVGSVGElement>(null);
  const handle = useMushroomRig({ emotion, talking, idle, svgRef });
  const ids = useMemo(() => mushroomIds(reactId), [reactId]);

  useImperativeHandle(ref, () => handle, [handle]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${MUSHROOM_VIEWBOX} ${MUSHROOM_VIEWBOX}`}
      width={size}
      height={size}
      className={className}
      style={{ ...MUSHROOM_ROOT_STYLE, '--om-ink-stroke': strokeBoostForSize(size), ...style } as CSSProperties}
      data-mushroom-root=""
      data-mushroom-emotion={initialEmotion}
      data-mushroom-target={emotion}
      data-mushroom-talking={talking ? '' : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <MushroomHat ids={ids} />
      <MushroomBody ids={ids} palette={MUSHROOM_PALETTES[initialEmotion]} />
      <MushroomFace ids={ids} frame={MUSHROOM_FRAMES[initialEmotion]} />
    </svg>
  );
};
