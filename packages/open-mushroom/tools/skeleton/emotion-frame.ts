import paper from 'paper-jsdom';

import {
  MUSHROOM_EYE_SLOTS,
  MUSHROOM_SLOT_IDS,
  type MushroomEyeSide,
  type MushroomSlotId,
} from '../../src/core/constants/mushroom-slots';
import type { MushroomCircle, MushroomEmotionFrame, MushroomPoint } from '../../src/core/types/mushroom-manifest.types';

import type { AssembledEmotion } from './assemble-frame';
import type { Registration } from './cut-plan';
import type { Point2 } from './knife-geometry';
import { normalizePathStart, START_RULES } from './normalize-path-start';
import { type PathItem } from './paper-context';
import { assertClosingGap, pathDataOf } from './path-data';

const WRIST_INSET = 0.15;

const round1 = (value: number): number => Math.round(value * 10) / 10;

const registrationMatrix = (registration: Registration): paper.Matrix => {
  const radians = (registration.rotateDeg * Math.PI) / 180;
  const cos = Math.cos(radians) * registration.scale;
  const sin = Math.sin(radians) * registration.scale;

  return new paper.Matrix(cos, sin, -sin, cos, registration.translate[0], registration.translate[1]);
};

const centerOf = (item: PathItem): MushroomPoint => ({
  x: round1(item.bounds.center.x),
  y: round1(item.bounds.center.y),
});

/* Pivot for the scratching animation: where the arm enters the frame, bottom-left of the hand. */
const wristOf = (hand: PathItem): MushroomPoint => ({
  x: round1(hand.bounds.left + hand.bounds.width * WRIST_INSET),
  y: round1(hand.bounds.bottom - hand.bounds.height * WRIST_INSET),
});

/* Registers the pieces into face space (mutates them) and serialises the frame. Run after the render check. */
export const toEmotionFrame = (
  assembled: AssembledEmotion,
  anchorCounts: Record<MushroomSlotId, number>,
  registration?: Registration,
  references?: Partial<Record<MushroomSlotId, Point2>>,
): MushroomEmotionFrame => {
  const matrix = registration ? registrationMatrix(registration) : null;
  const slots = {} as MushroomEmotionFrame['slots'];

  for (const slot of MUSHROOM_SLOT_IDS) {
    const piece = assembled.pieces[slot];

    if (piece && matrix) piece.transform(matrix);
    const anchor = assembled.starts[slot];
    const registeredAnchor =
      anchor && matrix
        ? matrix.transform(new paper.Point(anchor[0], anchor[1]))
        : anchor && new paper.Point(anchor[0], anchor[1]);

    if (piece) {
      const reference = references?.[slot];

      normalizePathStart(piece, START_RULES[slot], {
        count: anchorCounts[slot],
        label: `${assembled.emotion}/${slot}`,
        ...(reference ? { reference } : {}),
        ...(registeredAnchor ? { anchor: [registeredAnchor.x, registeredAnchor.y] as Point2 } : {}),
      });
    }
    const pathData = piece ? pathDataOf(piece) : null;

    if (pathData) assertClosingGap(pathData, `${assembled.emotion}/${slot}`);
    slots[slot] = pathData;
  }
  const pupilFor = (side: MushroomEyeSide): MushroomCircle | null => {
    const circle = assembled.pupils[side];

    if (!circle || !matrix || !registration) return circle;
    const center = matrix.transform(new paper.Point(circle.cx, circle.cy));

    return { cx: round1(center.x), cy: round1(center.y), r: round1(circle.r * registration.scale) };
  };
  const eyeAnchor = (side: MushroomEyeSide): MushroomPoint => {
    const { ring, white } = MUSHROOM_EYE_SLOTS[side];
    const item = assembled.pieces[white] ?? assembled.pieces[ring];

    if (!item) throw new Error(`${assembled.emotion}: no ${side} eye to anchor`);

    return centerOf(item);
  };
  const { mouth } = assembled.pieces;

  if (!mouth) throw new Error(`${assembled.emotion}: mouth slot is empty`);
  const { hand } = assembled.pieces;

  return {
    slots,
    pupils: { left: pupilFor('left'), right: pupilFor('right') },
    anchors: {
      eyeLeft: eyeAnchor('left'),
      eyeRight: eyeAnchor('right'),
      mouth: centerOf(mouth),
      ...(hand ? { hand: wristOf(hand) } : {}),
    },
    ...(registration ? { registration } : {}),
  };
};
