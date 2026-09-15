import { HAT_LAYOUT, layoutTransform } from '../core/constants/mushroom-layout';
import { MUSHROOM_HAT } from '../core/constants/mushroom-manifest';
import type { MushroomIds } from './mushroom-ids';

/* Lowest layer: the purple cap, its lower part hidden behind the body blob. */
export const MushroomHat = ({ ids }: { ids: MushroomIds }) => {
  const { gradient, d } = MUSHROOM_HAT;

  return (
    <>
      <defs>
        <linearGradient
          id={ids.hatGradient}
          gradientUnits="userSpaceOnUse"
          x1={gradient.x1}
          y1={gradient.y1}
          x2={gradient.x2}
          y2={gradient.y2}
        >
          {gradient.stops.map((stop) => (
            <stop key={stop.offset} offset={stop.offset} stopColor={stop.color} />
          ))}
        </linearGradient>
      </defs>
      <g data-mushroom-layer="hat" transform={layoutTransform(HAT_LAYOUT)}>
        <g data-mushroom-anim="hat">
          <g data-mushroom-anim="hat-scenario">
            <path d={d} fill={`url(#${ids.hatGradient})`} />
          </g>
        </g>
      </g>
    </>
  );
};
