'use client';

import { useTranslations } from 'next-intl';
import type { MushroomEmotion } from 'open-mushroom';
import { MUSHROOM_EMOTIONS } from 'open-mushroom/core';

import { cn } from '@/lib/utils';
import { LabPanel, LabToggle } from '@/modules/lab/components/lab-panel';
import { LAB_BACKGROUNDS, LAB_SIZES, type LabBackground } from '@/modules/lab/constants/lab-presets';
import type { LabAction, LabState } from '@/modules/lab/state/lab-state';
import { Button } from '@/components/ui/button';

interface LabStageControlsProps {
  state: LabState;
  dispatch: (action: LabAction) => void;
}

const PERCENT = 100;
const OVERLAYS: ReadonlyArray<keyof LabState['overlay']> = ['slots', 'labels', 'pivots', 'clips'];

/* Size, background, second instance, overlays and onion-skin for the preview stage. */
export const LabStageControls = ({ state, dispatch }: LabStageControlsProps) => {
  const t = useTranslations('lab.scene');

  return (
    <LabPanel title={t('title')}>
      <div className="flex flex-wrap gap-1" role="group" aria-label={t('size')}>
        {Object.entries(LAB_SIZES).map(([name, px]) => (
          <Button
            key={name}
            size="xs"
            variant="outline"
            aria-pressed={px === state.size}
            className={cn(px === state.size && 'bg-muted')}
            onClick={() => {
              dispatch({ type: 'patch', patch: { size: px } });
            }}
          >
            {px}
          </Button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1" role="group" aria-label={t('backgroundLabel')}>
        {(Object.keys(LAB_BACKGROUNDS) as LabBackground[]).map((background) => (
          <Button
            key={background}
            size="xs"
            variant="outline"
            aria-pressed={background === state.background}
            className={cn(background === state.background && 'bg-muted')}
            onClick={() => {
              dispatch({ type: 'patch', patch: { background } });
            }}
          >
            {t(`background.${background}`)}
          </Button>
        ))}
      </div>
      <LabToggle
        label={t('secondInstance')}
        checked={state.secondInstance}
        onChange={(secondInstance) => {
          dispatch({ type: 'patch', patch: { secondInstance } });
        }}
      />
      <div className="grid grid-cols-2 gap-1">
        {OVERLAYS.map((key) => (
          <LabToggle
            key={key}
            label={t(`overlay.${key}`)}
            checked={state.overlay[key]}
            onChange={(value) => {
              dispatch({ type: 'overlay', patch: { [key]: value } });
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span>{t('onion')}</span>
        <select
          aria-label={t('onionEmotion')}
          className="rounded-md border px-1 py-0.5"
          value={state.onionEmotion ?? ''}
          onChange={(event) => {
            const value = event.target.value as MushroomEmotion | '';

            dispatch({ type: 'patch', patch: { onionEmotion: value === '' ? null : value } });
          }}
        >
          <option value="">{t('none')}</option>
          {MUSHROOM_EMOTIONS.map((id) => (
            <option key={id} value={id}>
              {id}
            </option>
          ))}
        </select>
        <input
          type="range"
          aria-label={t('onionOpacity')}
          min={0}
          max={PERCENT}
          value={Math.round(state.onionOpacity * PERCENT)}
          className="flex-1"
          onChange={(event) => {
            dispatch({ type: 'patch', patch: { onionOpacity: Number(event.target.value) / PERCENT } });
          }}
        />
      </div>
    </LabPanel>
  );
};
