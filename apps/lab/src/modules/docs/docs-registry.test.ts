import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { DOCS_NAV, DOCS_SLUGS, docsNeighbours, docsPath } from '@/modules/docs/docs-nav';
import { DOCS_REGISTRY_SLUGS, hasDoc } from '@/modules/docs/docs-registry';
import { EXAMPLE_NAMES } from '@/modules/docs/examples/examples-registry';
import en from '../../../messages/en.json';
import uk from '../../../messages/uk.json';

const CONTENT_DIR = path.join(import.meta.dirname, '../../content/docs');

/* Every `<ComponentPreview name="…">` in the pages, per language file. */
const previewNames = (): Array<[string, string]> =>
  ['en', 'uk'].flatMap((locale) =>
    readdirSync(path.join(CONTENT_DIR, locale)).flatMap((file) => {
      const text = readFileSync(path.join(CONTENT_DIR, locale, file), 'utf8');

      return [...text.matchAll(/<ComponentPreview name="([^"]+)"/g)].map(
        (match) => [`${locale}/${file}`, match[1] ?? ''] as [string, string],
      );
    }),
  );

describe('documentation registry', () => {
  it('knows every page in the reading order, each exactly once in the navigation', () => {
    expect([...DOCS_REGISTRY_SLUGS].sort()).toEqual([...DOCS_SLUGS].sort());
    expect(DOCS_NAV.flatMap((group) => group.slugs).sort()).toEqual([...DOCS_SLUGS].sort());
  });

  it('has a title for every page and group in both languages', () => {
    for (const slug of DOCS_SLUGS) {
      expect(en.docs.nav.pages[slug].length, slug).toBeGreaterThan(0);
      expect(uk.docs.nav.pages[slug].length, slug).toBeGreaterThan(0);
    }
    for (const { group } of DOCS_NAV) {
      expect(en.docs.nav.groups[group].length, group).toBeGreaterThan(0);
      expect(uk.docs.nav.groups[group].length, group).toBeGreaterThan(0);
    }
  });

  it.each(['constructor', '__proto__', 'hasOwnProperty', 'a/b', '', 'Introduction'])('rejects "%s"', (slug) => {
    expect(hasDoc(slug)).toBe(false);
  });

  it('names only registered examples in the pages, the same ones in both languages', () => {
    const names = previewNames();

    expect(names.length).toBeGreaterThan(0);
    for (const [page, name] of names) {
      expect(EXAMPLE_NAMES, `${page} → ${name}`).toContain(name);
    }
    const perLocale = (locale: string): string[] =>
      names.filter(([page]) => page.startsWith(locale)).map(([, name]) => name);

    expect(perLocale('uk')).toEqual(perLocale('en'));
  });

  it('keeps the introduction at /docs and the rest one segment deep', () => {
    expect(docsPath('introduction')).toBe('/docs');
    expect(docsPath('api-reference')).toBe('/docs/api-reference');
    expect(docsNeighbours('introduction')).toEqual({ previous: null, next: 'emotions' });
    expect(docsNeighbours('api-reference')).toEqual({ previous: 'theming-sizing-and-ssr', next: null });
  });
});
