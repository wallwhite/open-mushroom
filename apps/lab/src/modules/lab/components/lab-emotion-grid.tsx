'use client';

import { useTranslations } from 'next-intl';
import { Mushroom, type MushroomEmotion } from 'open-mushroom';
import { MUSHROOM_EMOTIONS } from 'open-mushroom/core';

import { cn } from '@/lib/utils';
import { LabPanel } from '@/modules/lab/components/lab-panel';
import { LAB_THUMB_SIZE } from '@/modules/lab/constants/lab-presets';

interface LabEmotionGridProps {
  emotion: MushroomEmotion;
  onSelect: (emotion: MushroomEmotion) => void;
}

/* Seven still thumbnails that drive the preview; the emotion id doubles as the caption. */
export const LabEmotionGrid = ({ emotion, onSelect }: LabEmotionGridProps) => {
  const t = useTranslations('lab.emotions');

  return (
    <LabPanel title={t('title')}>
      <div className="grid grid-cols-4 gap-1">
        {MUSHROOM_EMOTIONS.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={id === emotion}
            data-lab-emotion={id}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-xl p-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
              id === emotion && 'bg-muted font-semibold text-foreground',
            )}
            onClick={() => {
              onSelect(id);
            }}
          >
            <Mushroom emotion={id} size={LAB_THUMB_SIZE} idle={false} />
            {id}
          </button>
        ))}
      </div>
    </LabPanel>
  );
};
