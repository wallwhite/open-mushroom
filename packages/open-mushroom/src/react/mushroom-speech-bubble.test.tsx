// @vitest-environment jsdom
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MushroomSpeechBubble } from './mushroom-speech-bubble';

const stubMatchMedia = (matches: boolean): void => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
};

const rootOf = (container: HTMLElement): HTMLElement => {
  const root = container.firstElementChild;

  if (!(root instanceof HTMLElement)) throw new Error('bubble root not rendered');

  return root;
};

beforeEach(() => {
  stubMatchMedia(false);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('MushroomSpeechBubble', () => {
  it('renders the speaker line only when a speaker is given', () => {
    const { container, rerender } = render(<MushroomSpeechBubble visible text="Hello" />);

    expect(container.querySelector('.om-bubble__speaker')).toBeNull();
    expect(container.querySelector('.om-bubble__text')?.textContent).toBe('Hello');

    rerender(<MushroomSpeechBubble visible text="Hello" speaker="Mushroom" />);

    expect(container.querySelector('.om-bubble__speaker')?.textContent).toBe('Mushroom');
  });

  it('is hidden from assistive technology and starts invisible', () => {
    const { container } = render(<MushroomSpeechBubble visible text="Hello" />);
    const root = rootOf(container);

    expect(root.getAttribute('aria-hidden')).toBe('true');
    expect(root.style.opacity).toBe('0');
  });

  it('makes the card clickable only while visible with a dismiss handler', () => {
    const onDismiss = vi.fn();
    const { container, rerender } = render(<MushroomSpeechBubble visible text="Hi" onDismiss={onDismiss} />);
    const card = container.querySelector('.om-bubble__card');

    if (!(card instanceof HTMLElement)) throw new Error('card not rendered');
    expect(card.classList.contains('om-bubble__card--dismissable')).toBe(true);
    expect(card.getAttribute('role')).toBe('button');
    fireEvent.click(card);
    expect(onDismiss).toHaveBeenCalledTimes(1);

    rerender(<MushroomSpeechBubble text="Hi" visible={false} onDismiss={onDismiss} />);
    expect(card.classList.contains('om-bubble__card--dismissable')).toBe(false);

    rerender(<MushroomSpeechBubble visible text="Hi" />);
    expect(card.classList.contains('om-bubble__card--dismissable')).toBe(false);
  });

  it('keeps the last line while the text empties for the exit', () => {
    const { container, rerender } = render(<MushroomSpeechBubble visible text="Last words" />);

    rerender(<MushroomSpeechBubble text="" visible={false} />);

    expect(container.querySelector('.om-bubble__text')?.textContent).toBe('Last words');
  });

  it('shows the card instantly, level and sharp, under reduced motion', async () => {
    stubMatchMedia(true);
    const { container } = render(<MushroomSpeechBubble visible text="Hi" />);
    const root = rootOf(container);

    await waitFor(() => {
      expect(root.style.opacity).toBe('1');
    });
    expect(root.style.filter).toBe('none');
  });

  it('arrives blurred when motion is allowed', async () => {
    const { container } = render(<MushroomSpeechBubble visible text="Hi" />);
    const root = rootOf(container);

    await waitFor(() => {
      expect(root.style.filter).toContain('blur');
    });
  });
});
