import { type ComponentProps, isValidElement } from 'react';

import { getTranslations } from 'next-intl/server';

import { HighlightedCode } from '@/modules/docs/components/highlighted-code';
import { CopyButton } from '@/components/ui/copy-button';

interface Fence {
  code: string;
  lang: string;
}

/* MDX renders a fence as `pre > code`, the language in the code's class and the text as its only child. */
const readFence = (children: ComponentProps<'pre'>['children']): Fence => {
  if (!isValidElement<{ className?: string; children?: unknown }>(children)) return { code: '', lang: 'text' };
  const { className = '', children: text } = children.props;

  return {
    code: typeof text === 'string' ? text.trimEnd() : '',
    lang: /language-(\w+)/.exec(className)?.[1] ?? 'text',
  };
};

export const CodeBlock = async ({ children }: ComponentProps<'pre'>) => {
  const { code, lang } = readFence(children);
  const t = await getTranslations('docs.code');

  return (
    <div className="not-prose relative my-5">
      <HighlightedCode code={code} lang={lang} />
      <CopyButton text={code} label={t('copy')} copiedLabel={t('copied')} className="absolute top-2 right-2" />
    </div>
  );
};
