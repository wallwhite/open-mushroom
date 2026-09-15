import type { MDXComponents } from 'mdx/types';

import { Callout } from '@/modules/docs/components/callout';
import { CodeBlock } from '@/modules/docs/components/code-block';
import { ComponentPreview } from '@/modules/docs/components/component-preview';
import { DocsHeading2, DocsHeading3 } from '@/modules/docs/components/docs-heading';
import { DocsLink } from '@/modules/docs/components/docs-link';
import { DocsTable } from '@/modules/docs/components/docs-table';

/*
 * What the documentation pages render through: anchored headings, locale-aware
 * links, highlighted code with a copy button, scrollable tables, and the two
 * blocks the pages use by name.
 */
const components: MDXComponents = {
  h2: DocsHeading2,
  h3: DocsHeading3,
  a: DocsLink,
  pre: CodeBlock,
  table: DocsTable,
  Callout,
  ComponentPreview,
};

export const useMDXComponents = (passed: MDXComponents = {}): MDXComponents => ({ ...passed, ...components });
