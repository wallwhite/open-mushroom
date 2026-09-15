import type { MushroomEmotion, MushroomIdleParts } from 'open-mushroom';
import { ALL_IDLE_PARTS } from 'open-mushroom/core';

import { LAB_DEFAULT_SIZE, type LabBackground } from '@/modules/lab/constants/lab-presets';

/* All lab UI state in one reducer; the mushroom itself only ever sees emotion, size, idle parts and talking. */
export interface LabOverlay {
  slots: boolean;
  labels: boolean;
  pivots: boolean;
  clips: boolean;
}

export interface LabBubble {
  text: string;
  visible: boolean;
}

export interface LabState {
  emotion: MushroomEmotion;
  size: number;
  background: LabBackground;
  secondInstance: boolean;
  /* No panel for these two: the debug handle drives them for visual QA. */
  mounted: boolean;
  holdAt: number | null;
  overlay: LabOverlay;
  onionEmotion: MushroomEmotion | null;
  onionOpacity: number;
  idleParts: MushroomIdleParts;
  talking: boolean;
  bubble: LabBubble;
}

export type LabAction =
  | { type: 'patch'; patch: Partial<Omit<LabState, 'overlay' | 'idleParts' | 'bubble'>> }
  | { type: 'overlay'; patch: Partial<LabOverlay> }
  | { type: 'idle'; patch: Partial<MushroomIdleParts> }
  | { type: 'bubble'; patch: Partial<LabBubble> };

const DEFAULT_ONION_OPACITY = 0.4;

export const INITIAL_LAB_STATE: LabState = {
  emotion: 'neutral',
  size: LAB_DEFAULT_SIZE,
  background: 'page',
  secondInstance: false,
  mounted: true,
  holdAt: null,
  overlay: { slots: false, labels: false, pivots: false, clips: false },
  onionEmotion: null,
  onionOpacity: DEFAULT_ONION_OPACITY,
  idleParts: ALL_IDLE_PARTS,
  talking: false,
  bubble: { text: '', visible: false },
};

export const labReducer = (state: LabState, action: LabAction): LabState => {
  switch (action.type) {
    case 'patch': {
      return { ...state, ...action.patch };
    }
    case 'overlay': {
      return { ...state, overlay: { ...state.overlay, ...action.patch } };
    }
    case 'idle': {
      return { ...state, idleParts: { ...state.idleParts, ...action.patch } };
    }
    case 'bubble': {
      return { ...state, bubble: { ...state.bubble, ...action.patch } };
    }
    default: {
      return state;
    }
  }
};
