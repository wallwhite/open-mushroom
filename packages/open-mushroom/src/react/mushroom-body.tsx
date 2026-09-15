import { BODY_ELLIPSES, BODY_GRADIENT_STOPS } from '../core/constants/mushroom-layout';
import type { MushroomPalette } from '../core/constants/mushroom-palettes';
import type { MushroomIds } from './mushroom-ids';

const GRADIENT_CENTER = 0.5;

/*
 * The body: three soft radial-gradient ellipses (no filters, Safari-safe).
 * Gradient stops carry `data-mushroom-stop` so a palette change tweens colours,
 * and the gradient geometry tweens for the idle shimmer.
 */
export const MushroomBody = ({ ids, palette }: { ids: MushroomIds; palette: MushroomPalette }) => (
  <>
    <defs>
      {BODY_ELLIPSES.map((ellipse) => (
        <radialGradient
          key={ellipse.key}
          id={ids.gradient(ellipse.key)}
          data-mushroom-gradient={ellipse.key}
          cx={GRADIENT_CENTER}
          cy={GRADIENT_CENTER}
          r={GRADIENT_CENTER}
        >
          {BODY_GRADIENT_STOPS[ellipse.key].map((stop) => (
            <stop
              key={stop.offset}
              offset={stop.offset}
              stopColor={palette[ellipse.key]}
              stopOpacity={stop.opacity}
              data-mushroom-stop={ellipse.key}
            />
          ))}
        </radialGradient>
      ))}
    </defs>
    <g data-mushroom-layer="body">
      <g data-mushroom-anim="body">
        {BODY_ELLIPSES.map((ellipse) => (
          <ellipse
            key={ellipse.key}
            data-mushroom-body={ellipse.key}
            cx={ellipse.cx}
            cy={ellipse.cy}
            rx={ellipse.rx}
            ry={ellipse.ry}
            fill={`url(#${ids.gradient(ellipse.key)})`}
          />
        ))}
      </g>
    </g>
  </>
);
