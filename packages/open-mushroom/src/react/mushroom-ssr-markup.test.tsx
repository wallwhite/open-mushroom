import { createHash } from 'node:crypto';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { MUSHROOM_EMOTIONS, type MushroomEmotion } from '../core/constants/mushroom-emotions';
import { MUSHROOM_SLOT_IDS, MUSHROOM_WHITE_SLOTS } from '../core/constants/mushroom-slots';
import { strokeBoostForSize } from '../core/helpers/stroke-boost';
import baseline from './fixtures/ssr-markup.baseline.json';
import { Mushroom } from './mushroom';

/*
 * Server markup captured from the rig's previous host right before the
 * extraction. Path data is digested there (the manifest checksum test covers
 * it byte for byte); everything else, structure, attributes, transforms and
 * gradients, must match once naming and styling differences are normalised.
 */
const MIN_DIGEST_LENGTH = 64;
const DIGEST_LENGTH = 16;

const digestPathData = (html: string): string =>
  html.replaceAll(/ d="([^"]*)"/g, (match, value: string) =>
    value.length > MIN_DIGEST_LENGTH
      ? ` d="sha256:${createHash('sha256').update(value).digest('hex').slice(0, DIGEST_LENGTH)}:${value.length}"`
      : match,
  );

/* Drops classes and inline styles (paint moved from a stylesheet to inline styles), unifies names and React ids. */
const normalize = (html: string): string =>
  digestPathData(html)
    .replaceAll(/ (?:class|style)="[^"]*"/g, '')
    .replaceAll('mushroom', 'mascot')
    .replaceAll(
      /mascot-[\w-]+?-(hat|body-(?:halo|tint|core)|white-(?:left|right)|clip-(?:left|right))\b/g,
      'mascot-ID-$1',
    );

const isEmotion = (value: string): value is MushroomEmotion => (MUSHROOM_EMOTIONS as readonly string[]).includes(value);

describe('server-rendered markup', () => {
  it.each(baseline.frames)(
    'matches the captured frame of $emotion at $size px (talking: $talking)',
    ({ emotion, size, talking, html }) => {
      if (!isEmotion(emotion)) throw new Error(`unknown emotion in fixture: ${emotion}`);
      const rendered = renderToStaticMarkup(<Mushroom emotion={emotion} size={size} talking={talking} idle={false} />);

      expect(normalize(rendered)).toBe(normalize(html));
    },
  );

  it('paints whites white, everything else ink, and sets the stroke boost on the root', () => {
    const size = 56;
    const rendered = renderToStaticMarkup(<Mushroom emotion="neutral" size={size} idle={false} />);
    const slots = [...rendered.matchAll(/<path[^>]*data-mushroom-slot="([^"]+)"[^>]*>/g)];
    const inkStyle =
      'style="fill:var(--om-ink, #000);stroke:var(--om-ink, #000);stroke-width:var(--om-ink-stroke, 0);stroke-linejoin:round;stroke-linecap:round"';
    const whiteStyle = 'style="fill:var(--om-white, #fff)"';

    expect(slots).toHaveLength(MUSHROOM_SLOT_IDS.length);
    for (const [tag, slot] of slots) {
      const white = (MUSHROOM_WHITE_SLOTS as readonly string[]).includes(slot ?? '');

      expect(tag, slot).toContain(white ? whiteStyle : inkStyle);
    }
    expect(rendered).toContain(
      `<svg viewBox="0 0 640 640" width="${size}" height="${size}" style="display:block;overflow:visible;--om-ink-stroke:${strokeBoostForSize(size)}"`,
    );
  });

  it('marks the root as talking only while talking', () => {
    const quiet = renderToStaticMarkup(<Mushroom emotion="neutral" size={96} idle={false} />);
    const talking = renderToStaticMarkup(<Mushroom talking emotion="neutral" size={96} idle={false} />);

    expect(quiet).not.toContain('data-mushroom-talking');
    expect(talking).toContain('data-mushroom-talking=""');
  });
});
