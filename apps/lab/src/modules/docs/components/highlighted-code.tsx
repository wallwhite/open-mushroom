import { codeToHtml } from 'shiki';

interface HighlightedCodeProps {
  code: string;
  lang: string;
}

/* Syntax colours at build time; the output is the highlighter's own markup for text from this repository. */
export const HighlightedCode = async ({ code, lang }: HighlightedCodeProps) => {
  const html = await codeToHtml(code, { lang, theme: 'github-light' });

  return <div className="docs-code" dangerouslySetInnerHTML={{ __html: html }} />;
};
