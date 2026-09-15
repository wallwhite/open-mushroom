'use client';

import type { RefObject } from 'react';

import { useTranslations } from 'next-intl';
import type { MushroomHandle, MushroomIdleParts } from 'open-mushroom';

import { LabPanel, LabToggle } from '@/modules/lab/components/lab-panel';
import { Button } from '@/components/ui/button';

interface LabIdlePanelProps {
  handleRef: RefObject<MushroomHandle | null>;
  idleParts: MushroomIdleParts;
  talking: boolean;
  onIdle: (patch: Partial<MushroomIdleParts>) => void;
  onTalking: (talking: boolean) => void;
}

const PARTS: ReadonlyArray<keyof MushroomIdleParts> = ['blink', 'gaze', 'breathe', 'shimmer'];

/* Idle life toggles, mouth chatter, one-shot blink; a click on the preview points the gaze. */
export const LabIdlePanel = ({ handleRef, idleParts, talking, onIdle, onTalking }: LabIdlePanelProps) => {
  const t = useTranslations('lab.idle');

  return (
    <LabPanel title={t('title')}>
      <div className="grid grid-cols-2 gap-1">
        {PARTS.map((part) => (
          <LabToggle
            key={part}
            label={t(part)}
            checked={idleParts[part]}
            onChange={(value) => {
              onIdle({ [part]: value });
            }}
          />
        ))}
      </div>
      <LabToggle label={t('talking')} checked={talking} onChange={onTalking} />
      <div className="flex gap-1">
        <Button
          size="xs"
          variant="outline"
          onClick={() => {
            handleRef.current?.blink();
          }}
        >
          {t('blinkNow')}
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => {
            handleRef.current?.lookAt(0, 0);
          }}
        >
          {t('lookCentre')}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground">{t('hint')}</p>
    </LabPanel>
  );
};
