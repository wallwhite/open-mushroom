'use client';

import { type CSSProperties, type MouseEvent, type RefObject, useRef } from 'react';

import { useTranslations } from 'next-intl';
import { Mushroom, type MushroomHandle, MushroomSpeechBubble } from 'open-mushroom';
import { MUSHROOM_BUBBLE_ANCHOR } from 'open-mushroom/core';

import { cn } from '@/lib/utils';
import { LabOverlayLayer } from '@/modules/lab/components/lab-overlay-layer';
import { LabPreviewCta } from '@/modules/lab/components/lab-preview-cta';
import { LAB_BACKGROUNDS, LAB_SECOND_INSTANCE_SIZE } from '@/modules/lab/constants/lab-presets';
import type { LabState } from '@/modules/lab/state/lab-state';

interface LabPreviewStageProps {
  state: LabState;
  handleRef: RefObject<MushroomHandle | null>;
  onDismissBubble: () => void;
}

const STAGE_MIN_HEIGHT = 480;
const SPAN = 2;
const UNIT = 1;

const clampUnit = (value: number): number => Math.max(-UNIT, Math.min(UNIT, value));
/* The package's anchor as custom properties, so the responsive classes below can switch to it. */
const BUBBLE_ANCHOR_VARS = {
  '--bubble-right': MUSHROOM_BUBBLE_ANCHOR.right,
  '--bubble-bottom': MUSHROOM_BUBBLE_ANCHOR.bottom,
} as CSSProperties;

/* The preview under test with its companions: the bubble beside it (above it in a narrow stage), onion-skin twin, overlay, a header-sized second instance, and the calls to action. */
export const LabPreviewStage = ({ state, handleRef, onDismissBubble }: LabPreviewStageProps) => {
  const t = useTranslations('lab');
  const boxRef = useRef<HTMLDivElement>(null);
  const overlayOn = Object.values(state.overlay).some(Boolean);
  const dark = state.background === 'dark';
  /* Clicking the preview points the gaze at the pointer. */
  const lookAtPointer = (event: MouseEvent<HTMLDivElement>): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const dx = ((event.clientX - rect.left) / rect.width) * SPAN - UNIT;
    const dy = ((event.clientY - rect.top) / rect.height) * SPAN - UNIT;

    handleRef.current?.lookAt(clampUnit(dx), clampUnit(dy));
  };

  return (
    <section
      style={{ minHeight: STAGE_MIN_HEIGHT }}
      className={cn(
        /* A narrow stage hangs the bubble above the character and needs room for it at the top; the stage is its own container so the switch follows its width, not the viewport's. */
        '@container flex flex-col items-center justify-center gap-10 rounded-3xl p-8 pt-24 @min-[46rem]:pt-8',
        LAB_BACKGROUNDS[state.background],
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-10">
        {/* With room for the card (17rem, the package's default `--om-bubble-width`) plus the hero size, the card hangs beside the body on the package's anchor and the margin keeps the pair centred; in a narrower stage it sits above the head, narrowed to stay on screen. */}
        <div className="relative @min-[46rem]:ml-[17rem]">
          <div
            className="absolute right-1/2 bottom-full z-10 @max-[46rem]:[--om-bubble-width:min(17rem,calc(50cqw_-_1rem))] @min-[46rem]:right-(--bubble-right) @min-[46rem]:bottom-(--bubble-bottom)"
            style={BUBBLE_ANCHOR_VARS}
          >
            <MushroomSpeechBubble
              text={state.bubble.text}
              visible={state.bubble.visible}
              speaker={t('bubble.speaker')}
              onDismiss={onDismissBubble}
            />
          </div>
          <div
            ref={boxRef}
            role="presentation"
            title={t('preview.lookAtHint')}
            className="relative"
            style={{ width: state.size, height: state.size }}
            data-lab-preview=""
            onClick={lookAtPointer}
          >
            {state.mounted ? (
              <Mushroom
                ref={handleRef}
                emotion={state.emotion}
                size={state.size}
                idle={state.idleParts}
                talking={state.talking}
              />
            ) : null}
            {state.onionEmotion ? (
              <div className="pointer-events-none absolute inset-0" style={{ opacity: state.onionOpacity }}>
                <Mushroom emotion={state.onionEmotion} size={state.size} idle={false} />
              </div>
            ) : null}
            {overlayOn ? <LabOverlayLayer boxRef={boxRef} emotion={state.emotion} overlay={state.overlay} /> : null}
          </div>
        </div>
        {state.secondInstance ? (
          <div className="flex items-center gap-3 rounded-2xl bg-card px-4 py-2 shadow-card">
            <Mushroom emotion={state.emotion} size={LAB_SECOND_INSTANCE_SIZE} talking={state.talking} />
            <div>
              <div className="text-sm font-bold">{t('scene.secondInstanceName')}</div>
              <div className="text-xs text-muted-foreground">{t('scene.secondInstanceRole')}</div>
            </div>
          </div>
        ) : null}
      </div>
      <div className={cn(dark && 'rounded-2xl bg-card/95 p-3')}>
        <LabPreviewCta />
      </div>
    </section>
  );
};
