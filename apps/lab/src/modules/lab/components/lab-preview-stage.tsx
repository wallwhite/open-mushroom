'use client';

import { type MouseEvent, type RefObject, useRef } from 'react';

import { useTranslations } from 'next-intl';
import { Mushroom, type MushroomHandle, MushroomSpeechBubble } from 'open-mushroom';

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

/* The preview under test with its companions: the bubble above it, onion-skin twin, overlay, a header-sized second instance, and the calls to action. */
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
        /* Extra room at the top: the bubble hangs above the character and must stay inside the card. */
        'flex flex-col items-center justify-center gap-10 rounded-3xl p-8 pt-20',
        LAB_BACKGROUNDS[state.background],
      )}
    >
      <div className="flex flex-wrap items-center justify-center gap-10">
        <div className="relative">
          {/* The card sits on the box's top edge, its tail reaching down to the hat, the corner over the centre; on phones the card narrows so it stays on screen. */}
          <div className="absolute right-1/2 bottom-full z-10 [--om-bubble-width:min(17rem,calc(50vw_-_1rem))]">
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
