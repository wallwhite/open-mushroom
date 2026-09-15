import type { ComponentType } from 'react';

import { BasicExample } from '@/modules/docs/examples/basic';
import { EmotionSwitcherExample } from '@/modules/docs/examples/emotion-switcher';
import { IdleAndTalkingExample } from '@/modules/docs/examples/idle-and-talking';
import { LookAtPointerExample } from '@/modules/docs/examples/look-at-pointer';
import { SpeechBubbleExample } from '@/modules/docs/examples/speech-bubble';
import { ThemingExample } from '@/modules/docs/examples/theming';

export interface ExampleEntry {
  component: ComponentType;
  /* File next to this registry; the preview shows its text as the example's code. */
  file: string;
}

/* Examples by the name the pages use; a Map keeps prototype keys from resolving. */
const EXAMPLES = new Map<string, ExampleEntry>([
  ['basic', { component: BasicExample, file: 'basic.tsx' }],
  ['emotion-switcher', { component: EmotionSwitcherExample, file: 'emotion-switcher.tsx' }],
  ['idle-and-talking', { component: IdleAndTalkingExample, file: 'idle-and-talking.tsx' }],
  ['look-at-pointer', { component: LookAtPointerExample, file: 'look-at-pointer.tsx' }],
  ['speech-bubble', { component: SpeechBubbleExample, file: 'speech-bubble.tsx' }],
  ['theming', { component: ThemingExample, file: 'theming.tsx' }],
]);

export const EXAMPLE_NAMES: readonly string[] = [...EXAMPLES.keys()];

export const getExample = (name: string): ExampleEntry => {
  const entry = EXAMPLES.get(name);

  if (!entry) throw new Error(`Unknown example: ${name}`);

  return entry;
};
