import type { MushroomGsap, MushroomAnimation, MushroomTimeline, MushroomContext } from './mushroom-gsap';

/*
 * One rig per mounted <Mushroom>: a gsap.context scoped to its <svg> plus an
 * explicit registry of every animation the rig created. Animations built from
 * callbacks (timeline complete, idle timers) escape the context otherwise, so
 * everything goes through `track` and `killAll` is authoritative on unmount.
 */
export interface MushroomRig {
  gsap: MushroomGsap;
  root: SVGSVGElement;
  context: MushroomContext;
  track: <T extends MushroomAnimation>(animation: T) => T;
  /* For reusable tweens (quickTo) that leave and re-join the timeline: never pruned, killed with the rest. */
  trackPersistent: <T extends MushroomAnimation>(animation: T) => T;
  untrack: (animation: MushroomAnimation) => void;
  killAll: () => void;
  activeCount: () => number;
  /* Lab diagnostics: what the active animations are touching. */
  describeActive: () => string[];
  dispose: () => void;
}

const describeTarget = (target: unknown): string => {
  if (!(target instanceof Element)) return typeof target;
  const marks = [...target.attributes]
    .filter((attribute) => attribute.name.startsWith('data-mushroom'))
    .map((attribute) => `${attribute.name}=${attribute.value}`)
    .join(' ');

  return marks.length > 0 ? `${target.tagName}[${marks}]` : target.tagName;
};

const targetsOf = (animation: MushroomAnimation): unknown[] =>
  'targets' in animation && typeof animation.targets === 'function' ? (animation.targets() as unknown[]) : [];

const describeAnimation = (animation: MushroomAnimation): string => {
  if ('getChildren' in animation) {
    const children = (animation as MushroomTimeline).getChildren(true, true, false);
    const targets = new Set(children.flatMap((child) => targetsOf(child).map((target) => describeTarget(target))));

    return `timeline:${[...targets].join(',') || '-'}`;
  }

  return `tween:${
    targetsOf(animation)
      .map((target) => describeTarget(target))
      .join(',') || '-'
  }`;
};

// GSAP reports parentless animations as active; a killed or auto-removed one has no parent, so it is dead here.
const isLive = (animation: MushroomAnimation): boolean => Boolean(animation.parent) && animation.isActive();

export const createMushroomRig = (gsapInstance: MushroomGsap, root: SVGSVGElement): MushroomRig => {
  const context = gsapInstance.context(() => {}, root);
  const tracked = new Set<MushroomAnimation>();
  const persistent = new Set<MushroomAnimation>();
  const prune = (): void => {
    for (const animation of tracked) {
      if (!animation.parent) tracked.delete(animation);
    }
  };
  const killAll = (): void => {
    for (const animation of tracked) animation.kill();
    for (const animation of persistent) animation.kill();
    tracked.clear();
    persistent.clear();
  };
  const active = (): MushroomAnimation[] => [...tracked, ...persistent].filter((animation) => isLive(animation));

  return {
    gsap: gsapInstance,
    root,
    context,
    track: (animation) => {
      prune();
      tracked.add(animation);

      return animation;
    },
    trackPersistent: (animation) => {
      persistent.add(animation);

      return animation;
    },
    untrack: (animation) => {
      tracked.delete(animation);
      persistent.delete(animation);
    },
    killAll,
    activeCount: () => active().length,
    describeActive: () => active().map((animation) => describeAnimation(animation)),
    dispose: () => {
      // Kill first (nothing may keep rendering), then clear what the context recorded.
      killAll();
      context.revert();
    },
  };
};
