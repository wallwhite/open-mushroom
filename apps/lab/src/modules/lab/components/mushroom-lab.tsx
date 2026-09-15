'use client';

import { useCallback, useReducer, useRef } from 'react';

import type { MushroomEmotion, MushroomHandle } from 'open-mushroom';

import { LabBubblePanel } from '@/modules/lab/components/lab-bubble-panel';
import { LabEmotionGrid } from '@/modules/lab/components/lab-emotion-grid';
import { LabHeroIntro } from '@/modules/lab/components/lab-hero-intro';
import { LabIdlePanel } from '@/modules/lab/components/lab-idle-panel';
import { LabPreviewCta } from '@/modules/lab/components/lab-preview-cta';
import { LabPreviewStage } from '@/modules/lab/components/lab-preview-stage';
import { LabStageControls } from '@/modules/lab/components/lab-stage-controls';
import { useLabDebugHandle } from '@/modules/lab/hooks/use-lab-debug-handle';
import { useLabHold } from '@/modules/lab/hooks/use-lab-hold';
import { usePageActiveTweens } from '@/modules/lab/hooks/use-page-active-tweens';
import { INITIAL_LAB_STATE, labReducer } from '@/modules/lab/state/lab-state';

/*
 * The playground: the introduction and the preview rig under test share the
 * hero, the controls that drive it sit in a row underneath. Anything the page
 * no longer shows but visual QA still needs (hold, mount/unmount, page-wide
 * counters) lives headless on `window.__mushroomLab`.
 */
export const MushroomLab = () => {
  const [state, dispatch] = useReducer(labReducer, INITIAL_LAB_STATE);
  const handleRef = useRef<MushroomHandle | null>(null);
  const pageActiveTweens = usePageActiveTweens();

  const setEmotion = useCallback((emotion: MushroomEmotion) => {
    dispatch({ type: 'patch', patch: { emotion } });
  }, []);
  const setSize = useCallback((size: number) => {
    dispatch({ type: 'patch', patch: { size } });
  }, []);
  const setMounted = useCallback((mounted: boolean) => {
    dispatch({ type: 'patch', patch: { mounted } });
  }, []);
  const setHoldAt = useCallback((holdAt: number | null) => {
    dispatch({ type: 'patch', patch: { holdAt } });
  }, []);
  const showBubble = useCallback((text: string) => {
    dispatch({ type: 'bubble', patch: { text, visible: true } });
  }, []);
  const hideBubble = useCallback(() => {
    dispatch({ type: 'bubble', patch: { visible: false } });
  }, []);

  useLabHold(handleRef, state.holdAt);
  useLabDebugHandle({ handleRef, setEmotion, setSize, setMounted, setHoldAt, showBubble, pageActiveTweens });

  return (
    <div className="flex flex-col gap-8">
      {/* The copy keeps a readable measure and the rest goes to the stage, which needs
          room for the character plus the speech bubble beside it before it stops
          hanging the card above the head. */}
      <section className="grid items-center gap-8 lg:grid-cols-[minmax(0,32rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <LabHeroIntro />
          <LabPreviewCta />
        </div>
        <LabPreviewStage state={state} handleRef={handleRef} onDismissBubble={hideBubble} />
      </section>
      {/* The panels drive the preview above them, so they are page content and carry no complementary landmark. */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <LabEmotionGrid emotion={state.emotion} onSelect={setEmotion} />
        <LabIdlePanel
          handleRef={handleRef}
          idleParts={state.idleParts}
          talking={state.talking}
          onIdle={(patch) => {
            dispatch({ type: 'idle', patch });
          }}
          onTalking={(talking) => {
            dispatch({ type: 'patch', patch: { talking } });
          }}
        />
        <LabBubblePanel onShowInPreview={showBubble} onHideInPreview={hideBubble} />
        <LabStageControls state={state} dispatch={dispatch} />
      </div>
    </div>
  );
};
