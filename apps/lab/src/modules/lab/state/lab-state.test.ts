import { describe, expect, it } from 'vitest';

import { INITIAL_LAB_STATE, labReducer } from '@/modules/lab/state/lab-state';

describe('labReducer', () => {
  it('starts mounted, with all idle parts, no hold and no bubble', () => {
    expect(INITIAL_LAB_STATE.mounted).toBe(true);
    expect(INITIAL_LAB_STATE.holdAt).toBeNull();
    expect(INITIAL_LAB_STATE.idleParts).toEqual({ blink: true, gaze: true, breathe: true, shimmer: true });
    expect(INITIAL_LAB_STATE.bubble).toEqual({ text: '', visible: false });
  });

  it('patches top-level fields without touching nested ones', () => {
    const next = labReducer(INITIAL_LAB_STATE, { type: 'patch', patch: { emotion: 'angry', size: 96, holdAt: 0.5 } });

    expect(next.emotion).toBe('angry');
    expect(next.size).toBe(96);
    expect(next.holdAt).toBe(0.5);
    expect(next.overlay).toBe(INITIAL_LAB_STATE.overlay);
    expect(next.idleParts).toBe(INITIAL_LAB_STATE.idleParts);
  });

  it('merges overlay, idle and bubble patches', () => {
    const withOverlay = labReducer(INITIAL_LAB_STATE, { type: 'overlay', patch: { slots: true } });
    const withIdle = labReducer(withOverlay, { type: 'idle', patch: { gaze: false } });
    const withBubble = labReducer(withIdle, { type: 'bubble', patch: { text: 'Hi', visible: true } });
    const hidden = labReducer(withBubble, { type: 'bubble', patch: { visible: false } });

    expect(withOverlay.overlay).toEqual({ slots: true, labels: false, pivots: false, clips: false });
    expect(withIdle.idleParts).toEqual({ blink: true, gaze: false, breathe: true, shimmer: true });
    expect(withBubble.bubble).toEqual({ text: 'Hi', visible: true });
    expect(hidden.bubble).toEqual({ text: 'Hi', visible: false });
  });
});
