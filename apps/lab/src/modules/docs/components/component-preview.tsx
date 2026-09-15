import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { getTranslations } from 'next-intl/server';

import { HighlightedCode } from '@/modules/docs/components/highlighted-code';
import { PreviewTabs } from '@/modules/docs/components/preview-tabs';
import { getExample } from '@/modules/docs/examples/examples-registry';
import { CopyButton } from '@/components/ui/copy-button';

interface ComponentPreviewProps {
  name: string;
}

/* Next runs the app from its own directory, so the examples resolve from there at build time. */
const EXAMPLES_DIR = path.join(process.cwd(), 'src/modules/docs/examples');

/* A live example next to its source, read from the same file, so the code tab can never drift from what runs. */
export const ComponentPreview = async ({ name }: ComponentPreviewProps) => {
  const { component: Example, file } = getExample(name);
  const t = await getTranslations('docs.preview');
  const copy = await getTranslations('docs.code');
  const raw = await readFile(path.join(EXAMPLES_DIR, file), 'utf8');
  const source = raw.trimEnd();

  return (
    <PreviewTabs
      previewLabel={t('preview')}
      codeLabel={t('code')}
      preview={<Example />}
      code={
        <div className="relative">
          <HighlightedCode code={source} lang="tsx" />
          <CopyButton
            text={source}
            label={copy('copy')}
            copiedLabel={copy('copied')}
            className="absolute top-2 right-2"
          />
        </div>
      }
    />
  );
};
