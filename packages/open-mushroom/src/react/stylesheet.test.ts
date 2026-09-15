import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const css = readFileSync(new URL('../styles/mushroom.css', import.meta.url), 'utf8');

const rule = (selector: string): string => {
  const match = new RegExp(`${selector.replace(/[.$*+?()[\]{}|^\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`).exec(css);

  if (!match) throw new Error(`no rule for ${selector}`);

  return match[1] ?? '';
};

/* Each of these declarations is load-bearing for the swing, the click model or the seamless tail. */
describe('mushroom.css', () => {
  it('swings the bubble around its bottom-right corner and lets clicks through by default', () => {
    expect(rule('.om-bubble')).toMatch(/transform-origin:\s*bottom right/);
    expect(rule('.om-bubble')).toMatch(/pointer-events:\s*none/);
  });

  it('takes clicks only on a dismissable card', () => {
    expect(rule('.om-bubble__card--dismissable')).toMatch(/pointer-events:\s*auto/);
    expect(rule('.om-bubble__card--dismissable')).toMatch(/cursor:\s*pointer/);
  });

  it('paints the tail in the card colour, rotated toward the mushroom', () => {
    expect(rule('.om-bubble__tail')).toMatch(/color:\s*var\(--om-bubble-bg/);
    expect(rule('.om-bubble__tail')).toMatch(/rotate\(-40deg\)/);
    expect(rule('.om-bubble__tail')).toMatch(/position:\s*absolute/);
  });
});
