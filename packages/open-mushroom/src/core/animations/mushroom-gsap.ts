/*
 * Lazy GSAP loader. Nothing in the package imports gsap statically: the
 * mushroom renders its initial emotion as plain SVG and animation arrives after
 * mount. The plugin is registered once per page, whichever rig asks first.
 */
import type { gsap as gsapCore } from 'gsap';

export type MushroomGsap = typeof gsapCore;

/* GSAP class types derived from the instance, so no ambient `gsap` namespace leaks into public declarations. */
export type MushroomAnimation = InstanceType<MushroomGsap['core']['Animation']>;
export type MushroomTween = InstanceType<MushroomGsap['core']['Tween']>;
export type MushroomTimeline = InstanceType<MushroomGsap['core']['Timeline']>;
export type MushroomContext = ReturnType<MushroomGsap['context']>;

let loading: Promise<MushroomGsap> | null = null;

export const ensureMushroomGsap = (): Promise<MushroomGsap> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('gsap is client-only'));
  loading ??= Promise.all([import('gsap'), import('gsap/MorphSVGPlugin')]).then(([core, morph]) => {
    core.gsap.registerPlugin(morph.MorphSVGPlugin);

    return core.gsap;
  });

  return loading;
};
