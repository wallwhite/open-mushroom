import type { MushroomAnimation } from '../mushroom-gsap';
import type { MushroomRig } from '../mushroom-rig-context';

/* A loop owns whatever it created and can stop it; the rig registry backs it up on unmount. */
export interface IdleLoop {
  stop: () => void;
}

/*
 * Runs `build` again every time its animation completes, until stopped.
 * Every animation is created inside the rig context and tracked, so the chain
 * never escapes the kill registry no matter how long it runs.
 */
export const chainForever = (rig: MushroomRig, build: () => MushroomAnimation | null): IdleLoop => {
  let stopped = false;
  let current: MushroomAnimation | null = null;
  const next = (): void => {
    if (stopped) return;
    current = rig.context.add(() => build());
    if (!current) return;
    rig.track(current);
    current.eventCallback('onComplete', next);
  };

  next();

  return {
    stop: () => {
      stopped = true;
      // revert() kills and puts every touched property back, so a stop mid-cycle leaves no partial transform.
      current?.revert();
      current = null;
    },
  };
};
