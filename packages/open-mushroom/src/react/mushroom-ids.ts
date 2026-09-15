import type { BodyLayerKey } from '../core/constants/mushroom-layout';
import type { MushroomEyeSide } from '../core/constants/mushroom-slots';

/* Every id inside one <Mushroom> is prefixed so several instances can share a page. */
export interface MushroomIds {
  hatGradient: string;
  gradient: (layer: BodyLayerKey) => string;
  white: (side: MushroomEyeSide) => string;
  clip: (side: MushroomEyeSide) => string;
}

export const mushroomIds = (reactId: string): MushroomIds => {
  const prefix = `mushroom-${reactId.replaceAll(/[^\w-]/g, '')}`;

  return {
    hatGradient: `${prefix}-hat`,
    gradient: (layer) => `${prefix}-body-${layer}`,
    white: (side) => `${prefix}-white-${side}`,
    clip: (side) => `${prefix}-clip-${side}`,
  };
};
