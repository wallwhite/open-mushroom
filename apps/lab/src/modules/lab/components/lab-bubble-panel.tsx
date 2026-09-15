'use client';

import { useState } from 'react';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMessages, useTranslations } from 'next-intl';
import { MushroomSpeechBubble } from 'open-mushroom';

import { LabPanel } from '@/modules/lab/components/lab-panel';
import { Button } from '@/components/ui/button';

interface LabBubblePanelProps {
  onShowInPreview: (text: string) => void;
  onHideInPreview: () => void;
}

/*
 * The speech bubble off its timer: step through the demo lines against the
 * real component with the arrows (they wrap around), and send the current
 * line to the preview or take it away again. The card in the panel is itself
 * a button for the same "show" action.
 */
export const LabBubblePanel = ({ onShowInPreview, onHideInPreview }: LabBubblePanelProps) => {
  const t = useTranslations('lab.bubble');
  const { lines } = useMessages().lab.bubble;
  const [index, setIndex] = useState(0);
  const current = lines[index] ?? '';
  /* Wraps at both ends: the last line is followed by the first and the first is preceded by the last. */
  const stepForward = (): void => {
    setIndex((previous) => (previous + 1) % lines.length);
  };
  const stepBack = (): void => {
    setIndex((previous) => (previous + lines.length - 1) % lines.length);
  };

  return (
    <LabPanel title={t('title')}>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <select
          aria-label={t('title')}
          defaultValue="demo"
          className="rounded-xl border border-border bg-card px-2 py-1 text-sm text-foreground"
        >
          <option value="demo">{t('set.demo')}</option>
        </select>
        <span>{t('counter', { index: index + 1, total: lines.length, chars: current.length })}</span>
      </div>
      {/* The bubble inside is decoration (it never takes pointer events); the button is the real control. */}
      <button
        type="button"
        aria-label={t('showInPreview')}
        title={t('showInPreview')}
        className="flex justify-end rounded-xl bg-muted p-4 pb-8 text-left transition-colors hover:bg-muted/70 focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        onClick={() => {
          onShowInPreview(current);
        }}
      >
        <MushroomSpeechBubble visible text={current} speaker={t('speaker')} />
      </button>
      <div className="flex items-center gap-2">
        <Button size="icon-sm" variant="outline" aria-label={t('previous')} onClick={stepBack}>
          <ChevronLeft />
        </Button>
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            onShowInPreview(current);
          }}
        >
          {t('show')}
        </Button>
        <Button size="sm" variant="outline" className="flex-1" onClick={onHideInPreview}>
          {t('hide')}
        </Button>
        <Button size="icon-sm" variant="outline" aria-label={t('next')} onClick={stepForward}>
          <ChevronRight />
        </Button>
      </div>
    </LabPanel>
  );
};
