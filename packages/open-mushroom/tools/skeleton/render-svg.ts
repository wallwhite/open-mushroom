import { MUSHROOM_SLOT_DEBUG_COLORS } from '../../src/core/constants/mushroom-slot-debug-colors';
import {
  MUSHROOM_EYE_SIDES,
  MUSHROOM_EYE_SLOTS,
  MUSHROOM_INK_PAINT_ORDER,
  MUSHROOM_SLOT_IDS,
  type MushroomSlotId,
} from '../../src/core/constants/mushroom-slots';

import type { AssembledEmotion } from './assemble-frame';
import { isWhiteFill } from './paper-context';
import { pathDataOf } from './path-data';
import { BACKGROUND } from './raster-diff';

/* SVG documents (source coordinates) used by the pixel gates and the debug renders. */
const EXTRA_PAINT_ORDER: Array<{ slot: MushroomSlotId; fill: string }> = [
  { slot: 'hand', fill: '#000' },
  { slot: 'drool-ink', fill: '#000' },
  { slot: 'drool-white', fill: '#fff' },
];

const svgOpen = (assembled: AssembledEmotion, pixelWidth: number): string => {
  const pixelHeight = Math.round((pixelWidth * assembled.height) / assembled.width);

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ` +
    `viewBox="0 0 ${assembled.width} ${assembled.height}" width="${pixelWidth}" height="${pixelHeight}">` +
    `<rect width="${assembled.width}" height="${assembled.height}" fill="${BACKGROUND}"/>`
  );
};

/* The Figma export minus the grey duplicate outlines. */
export const originalSvg = (assembled: AssembledEmotion, pixelWidth: number): string =>
  `${svgOpen(assembled, pixelWidth)}${assembled.originals
    .map((source) => `<path d="${source.d}" fill="${isWhiteFill(source.fill) ? '#fff' : '#000'}"/>`)
    .join('')}</svg>`;

/* Mirrors the runtime paint order: ink, eye whites, pupils clipped by the whites through <use>, extras. */
export const assemblySvg = (assembled: AssembledEmotion, pixelWidth: number, withPupils: boolean): string => {
  const pathTag = (slot: MushroomSlotId, fill: string, id?: string): string => {
    const piece = assembled.pieces[slot];
    const idAttribute = id ? ` id="${id}"` : '';

    return piece ? `<path${idAttribute} d="${pathDataOf(piece)}" fill="${fill}"/>` : '';
  };
  const ink = MUSHROOM_INK_PAINT_ORDER.map((slot) => pathTag(slot, '#000')).join('');
  const whites = MUSHROOM_EYE_SIDES.map((side) =>
    pathTag(MUSHROOM_EYE_SLOTS[side].white, '#fff', `white-${side}`),
  ).join('');
  const defs = MUSHROOM_EYE_SIDES.map(
    (side) => `<clipPath id="clip-${side}"><use href="#white-${side}" xlink:href="#white-${side}"/></clipPath>`,
  ).join('');
  const pupils = withPupils
    ? MUSHROOM_EYE_SIDES.map(
        (side) => `<g clip-path="url(#clip-${side})">${pathTag(MUSHROOM_EYE_SLOTS[side].pupil, '#000')}</g>`,
      ).join('')
    : '';
  const extras = EXTRA_PAINT_ORDER.map(({ slot, fill }) => pathTag(slot, fill)).join('');

  return `${svgOpen(assembled, pixelWidth)}<defs>${defs}</defs>${ink}${whites}${pupils}${extras}</svg>`;
};

/* Every slot in its own colour with a label, plus the fitted pupil circles. */
export const slotsSvg = (assembled: AssembledEmotion, pixelWidth: number): string => {
  const shapes = MUSHROOM_SLOT_IDS.map((slot, index) => {
    const piece = assembled.pieces[slot];

    if (!piece) return '';
    const color = MUSHROOM_SLOT_DEBUG_COLORS[index % MUSHROOM_SLOT_DEBUG_COLORS.length] ?? '#000';
    const { center } = piece.bounds;

    return (
      `<path d="${pathDataOf(piece)}" fill="${color}" fill-opacity="0.7"/>` +
      `<text x="${center.x}" y="${center.y}" font-size="22" font-family="Helvetica" font-weight="bold" ` +
      `text-anchor="middle" fill="#000" stroke="#fff" stroke-width="5" paint-order="stroke">${slot}</text>`
    );
  }).join('');
  const pupils = MUSHROOM_EYE_SIDES.map((side) => {
    const circle = assembled.pupils[side];

    return circle
      ? `<circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="none" stroke="#f0f" stroke-width="3"/>`
      : '';
  }).join('');

  return `${svgOpen(assembled, pixelWidth)}${shapes}${pupils}</svg>`;
};
