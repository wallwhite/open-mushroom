'use client';

import { useCallback, useReducer, useRef } from 'react';

import { useTranslations } from 'next-intl';
import type { MushroomEmotion, MushroomHandle } from 'open-mushroom';

import { LabBubblePanel } from '@/modules/lab/components/lab-bubble-panel';
import { LabEmotionGrid } from '@/modules/lab/components/lab-emotion-grid';
import { LabIdlePanel } from '@/modules/lab/components/lab-idle-panel';
import { LabPreviewStage } from '@/modules/lab/components/lab-preview-stage';
import { LabStageControls } from '@/modules/lab/components/lab-stage-controls';
import { useLabDebugHandle } from '@/modules/lab/hooks/use-lab-debug-handle';
import { useLabHold } from '@/modules/lab/hooks/use-lab-hold';
import { usePageActiveTweens } from '@/modules/lab/hooks/use-page-active-tweens';
import { INITIAL_LAB_STATE, labReducer } from '@/modules/lab/state/lab-state';

/*
 * The playground: one preview rig under test, thumbnails to drive it, idle
 * toggles, the speech bubble and scene controls. Anything the page no longer
 * shows but visual QA still needs (hold, mount/unmount, page-wide counters)
 * lives headless on `window.__mushroomLab`.
 */
export const MushroomLab = () => {
  const t = useTranslations('lab');
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

  useLabHold(handleRef, state.holdAt);
  useLabDebugHandle({ handleRef, setEmotion, setSize, setMounted, setHoldAt, showBubble, pageActiveTweens });

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <h1 className="sr-only">{t('title')}</h1>
        <LabPreviewStage
          state={state}
          handleRef={handleRef}
          onDismissBubble={() => {
            dispatch({ type: 'bubble', patch: { visible: false } });
          }}
        />
      </div>
      <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-[26rem]">
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
        <LabBubblePanel onShowInPreview={showBubble} />
        <LabStageControls state={state} dispatch={dispatch} />
      </aside>
    </div>
  );
};
