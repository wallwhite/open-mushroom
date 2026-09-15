'use client';

import { useState } from 'react';

import { useMessages, useTranslations } from 'next-intl';
import { MushroomSpeechBubble } from 'open-mushroom';

import { LabPanel } from '@/modules/lab/components/lab-panel';
import { Button } from '@/components/ui/button';

interface LabBubblePanelProps {
  onShowInPreview: (text: string) => void;
}

/*
 * The speech bubble off its timer: step through the demo lines against the
 * real component, hide and show it to watch the entrance and exit, and send
 * a line to the preview to see it next to the character.
 */
export const LabBubblePanel = ({ onShowInPreview }: LabBubblePanelProps) => {
  const t = useTranslations('lab.bubble');
  const { lines } = useMessages().lab.bubble;
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const position = index % lines.length;
  const current = lines[position] ?? '';

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
        <span>{t('counter', { index: position + 1, total: lines.length, chars: current.length })}</span>
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
        <MushroomSpeechBubble text={current} visible={visible} speaker={t('speaker')} />
      </button>
      <div className="flex gap-2">
        <Button
          size="sm"
          className="flex-1"
          onClick={() => {
            setIndex((previous) => previous + 1);
          }}
        >
          {t('next')}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setVisible((previous) => !previous);
          }}
        >
          {visible ? t('hide') : t('show')}
        </Button>
      </div>
    </LabPanel>
  );
};
