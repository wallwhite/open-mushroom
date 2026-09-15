'use client';

/*
 * Client entry: components and types only. Any value exported from a module
 * with the client directive becomes a client reference inside React Server
 * Components; constants live in `open-mushroom/core` instead.
 */
export type { MushroomIdleParts } from './core/animations/idle/idle-controller';
export type { MushroomTimeline } from './core/animations/mushroom-gsap';
export type { MushroomEmotion } from './core/constants/mushroom-emotions';
export type { MushroomHandle, MushroomRigSnapshot } from './core/types/mushroom-handle';
export { Mushroom } from './react/mushroom';
export type { MushroomProps } from './react/mushroom';
export { MushroomSpeechBubble } from './react/mushroom-speech-bubble';
export type { MushroomSpeechBubbleProps } from './react/mushroom-speech-bubble';
