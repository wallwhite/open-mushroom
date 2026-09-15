import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { routing } from '@/i18n/routing';

/*
 * The proxy matcher must be a literal inside proxy.ts (Next reads it statically), and importing proxy.ts
 * would pull the Next server runtime into a unit test, so the pattern is read from the source text.
 */
const proxySource = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8');
// The source spells a backslash as two characters; the runtime string has one.
const matcherLiteral = /matcher:\s*'([^']+)'/.exec(proxySource)?.[1]?.replaceAll('\\\\', '\\');
const matcher = new RegExp(`^${matcherLiteral ?? ''}$`);

describe('locale routing', () => {
  it('serves English at the bare path and Ukrainian under its prefix', () => {
    expect(routing.locales).toEqual(['en', 'uk']);
    expect(routing.defaultLocale).toBe('en');
    expect(routing.localePrefix).toBe('as-needed');
  });

  it('runs the proxy on pages but not on internals, API routes or files', () => {
    expect(matcherLiteral).toBeDefined();
    for (const path of ['/', '/uk', '/docs/introduction', '/uk/docs/introduction']) {
      expect(matcher.test(path), path).toBe(true);
    }
    for (const path of ['/_next/static/chunk.js', '/api/health', '/favicon.ico', '/_vercel/insights']) {
      expect(matcher.test(path), path).toBe(false);
    }
  });
});
