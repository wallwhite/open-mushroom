import { describe, expect, it } from 'vitest';

import { MUSHROOM_FRAMES } from '../constants/mushroom-manifest';
import { MUSHROOM_SLOT_IDS } from '../constants/mushroom-slots';
import { planTransition, type TransitionOp } from './mushroom-transition-plan';

const kindOf = (ops: TransitionOp[], slot: TransitionOp['slot']): TransitionOp['kind'] =>
  ops.find((op) => op.slot === slot)?.kind ?? 'noop';

describe('planTransition', () => {
  it('fades the hand in and the chin out when going neutral → thinking', () => {
    const ops = planTransition(MUSHROOM_FRAMES.neutral, MUSHROOM_FRAMES.thinking);

    expect(kindOf(ops, 'hand')).toBe('fade-in');
    expect(kindOf(ops, 'chin')).toBe('fade-out');
    expect(kindOf(ops, 'dimple-right')).toBe('fade-in');
    expect(kindOf(ops, 'brow-left')).toBe('morph');
    expect(kindOf(ops, 'pupil-left')).toBe('morph');
    expect(kindOf(ops, 'drool-ink')).toBe('noop');
  });

  it('fades the hand out when coming back from thinking', () => {
    const ops = planTransition(MUSHROOM_FRAMES.thinking, MUSHROOM_FRAMES.neutral);

    expect(kindOf(ops, 'hand')).toBe('fade-out');
    expect(kindOf(ops, 'chin')).toBe('fade-in');
  });

  it('brings whites and pupils back when waking up', () => {
    const ops = planTransition(MUSHROOM_FRAMES.sleep, MUSHROOM_FRAMES.neutral);

    expect(kindOf(ops, 'eye-left-white')).toBe('fade-in');
    expect(kindOf(ops, 'pupil-right')).toBe('fade-in');
    expect(kindOf(ops, 'drool-white')).toBe('fade-out');
    expect(kindOf(ops, 'eye-left-ring')).toBe('morph');
  });

  it('is a no-op for the same frame and covers every slot exactly once', () => {
    const ops = planTransition(MUSHROOM_FRAMES.angry, MUSHROOM_FRAMES.angry);

    expect(ops.map((op) => op.slot)).toEqual([...MUSHROOM_SLOT_IDS]);
    expect(ops.every((op) => op.kind === 'noop')).toBe(true);
  });
});
