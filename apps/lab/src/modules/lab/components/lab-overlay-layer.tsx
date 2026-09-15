'use client';

import { type RefObject, useEffect, useState } from 'react';

import {
  FACE_LAYOUT,
  faceToViewBox,
  layoutTransform,
  MUSHROOM_EYE_SIDES,
  MUSHROOM_EYE_SLOTS,
  MUSHROOM_FRAMES,
  MUSHROOM_SLOT_DEBUG_COLORS,
  MUSHROOM_SLOT_IDS,
  MUSHROOM_VIEWBOX,
  type MushroomEmotion,
  type MushroomSlotId,
} from 'open-mushroom/core';

import { LAB_POLL } from '@/modules/lab/constants/lab-presets';
import type { LabOverlay } from '@/modules/lab/state/lab-state';

interface LabOverlayLayerProps {
  boxRef: RefObject<HTMLDivElement | null>;
  emotion: MushroomEmotion;
  overlay: LabOverlay;
}

interface SlotSnapshot {
  slot: string;
  d: string;
  cx: number;
  cy: number;
  visible: boolean;
}

type Pivot = [name: string, x: number, y: number];

const LABEL_FONT = 16;
const PIVOT_RADIUS = 6;
const HALF = 2;
const SLOT_FILL_OPACITY = 0.55;
const CLIP_STROKE = 4;
const LABEL_STROKE = 3;
const WHITE_SLOTS = new Set<string>(MUSHROOM_EYE_SIDES.map((side) => MUSHROOM_EYE_SLOTS[side].white));

const toViewBox = (x: number, y: number): [number, number] => {
  const point = faceToViewBox({ x, y });

  return [point.x, point.y];
};

const colorOf = (slot: string): string =>
  MUSHROOM_SLOT_DEBUG_COLORS[MUSHROOM_SLOT_IDS.indexOf(slot as MushroomSlotId) % MUSHROOM_SLOT_DEBUG_COLORS.length] ??
  '#000';

/* Reads the live `d` of every slot from the preview SVG (what GSAP shows right now, paused frames included). */
const readSlots = (box: HTMLDivElement | null): SlotSnapshot[] => {
  const root = box?.querySelector<SVGSVGElement>('svg[data-mushroom-root]');

  if (!root) return [];

  return [...root.querySelectorAll<SVGPathElement>('[data-mushroom-slot]')].map((path) => {
    const bounds = path.getBBox();

    return {
      slot: path.dataset.mushroomSlot ?? '',
      d: path.getAttribute('d') ?? '',
      cx: bounds.x + bounds.width / HALF,
      cy: bounds.y + bounds.height / HALF,
      /* Computed, not the attribute: a slot that faded in keeps its server-rendered opacity="0" attribute under GSAP's inline style. */
      visible: getComputedStyle(path).opacity !== '0',
    };
  });
};

const pivotsOf = (emotion: MushroomEmotion): Pivot[] => {
  const { anchors } = MUSHROOM_FRAMES[emotion];
  const pivots: Pivot[] = [
    ['eyeL', anchors.eyeLeft.x, anchors.eyeLeft.y],
    ['eyeR', anchors.eyeRight.x, anchors.eyeRight.y],
    ['mouth', anchors.mouth.x, anchors.mouth.y],
  ];

  if (anchors.hand) pivots.push(['wrist', anchors.hand.x, anchors.hand.y]);

  return pivots;
};

const SlotShape = ({ snapshot }: { snapshot: SlotSnapshot }) => (
  <path d={snapshot.d} fill={colorOf(snapshot.slot)} fillOpacity={SLOT_FILL_OPACITY} />
);

const ClipOutline = ({ snapshot }: { snapshot: SlotSnapshot }) => (
  <path d={snapshot.d} fill="none" stroke="#f0f" strokeWidth={CLIP_STROKE} />
);

const PivotMark = ({ pivot: [name, px, py] }: { pivot: Pivot }) => {
  const [x, y] = toViewBox(px, py);
  const arm = PIVOT_RADIUS * HALF;

  return (
    <g>
      <circle cx={x} cy={y} r={PIVOT_RADIUS} fill="none" stroke="#f00" strokeWidth={2} />
      <line x1={x - arm} y1={y} x2={x + arm} y2={y} stroke="#f00" />
      <line x1={x} y1={y - arm} x2={x} y2={y + arm} stroke="#f00" />
      <text x={x + arm} y={y - PIVOT_RADIUS} fontSize={LABEL_FONT} fill="#f00">
        {name}
      </text>
    </g>
  );
};

const SlotLabel = ({ snapshot }: { snapshot: SlotSnapshot }) => {
  const [x, y] = toViewBox(snapshot.cx, snapshot.cy);

  return (
    <text
      x={x}
      y={y}
      fontSize={LABEL_FONT}
      textAnchor="middle"
      fill="#000"
      stroke="#fff"
      strokeWidth={LABEL_STROKE}
      paintOrder="stroke"
    >
      {snapshot.slot}
    </text>
  );
};

/* Debug drawing over the preview: coloured slots, labels, eye/wrist pivots, clip outlines. Same viewBox, so it scales with it. */
export const LabOverlayLayer = ({ boxRef, emotion, overlay }: LabOverlayLayerProps) => {
  const [slots, setSlots] = useState<SlotSnapshot[]>([]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSlots(readSlots(boxRef.current));
    }, LAB_POLL.overlayMs);

    return () => {
      window.clearInterval(interval);
    };
  }, [boxRef]);

  const shown = slots.filter((snapshot) => snapshot.visible && snapshot.d);
  const whites = slots.filter((snapshot) => WHITE_SLOTS.has(snapshot.slot) && snapshot.d);
  const slotShapes = overlay.slots
    ? shown.map((snapshot) => <SlotShape key={snapshot.slot} snapshot={snapshot} />)
    : null;
  const clipOutlines = overlay.clips
    ? whites.map((snapshot) => <ClipOutline key={`clip-${snapshot.slot}`} snapshot={snapshot} />)
    : null;
  const labels = overlay.labels
    ? shown.map((snapshot) => <SlotLabel key={`label-${snapshot.slot}`} snapshot={snapshot} />)
    : null;
  const pivots = overlay.pivots ? pivotsOf(emotion).map((pivot) => <PivotMark key={pivot[0]} pivot={pivot} />) : null;

  return (
    <svg
      className="pointer-events-none absolute inset-0"
      viewBox={`0 0 ${MUSHROOM_VIEWBOX} ${MUSHROOM_VIEWBOX}`}
      aria-hidden="true"
    >
      <g transform={layoutTransform(FACE_LAYOUT)}>
        {slotShapes}
        {clipOutlines}
      </g>
      {labels}
      {pivots}
    </svg>
  );
};
