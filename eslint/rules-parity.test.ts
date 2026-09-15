import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

import { renamedRules } from './rule-renames';
import { coreRules } from './rules-core';
import { importRules } from './rules-import';
import { jsxA11yRules } from './rules-jsx-a11y';
import { reactRules } from './rules-react';
import { sonarjsRules } from './rules-sonarjs';
import { typescriptRules } from './rules-typescript';
import { unicornRules } from './rules-unicorn';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
const referencePath = new URL('reference/upstream-effective-rules.txt', import.meta.url);

// The upstream project used eslint-plugin-import; this repo uses its maintained fork under the import-x prefix.
const renamedPrefixes: Array<[string, string]> = [['import/', 'import-x/']];

// Prettier options are compared by Prettier itself: the rule reads .prettierrc.json, which mirrors upstream.
const optionsExempt = new Set(['prettier/prettier']);

interface ReferenceRule {
  severity: 'error' | 'warn';
  options: unknown[] | undefined;
}

const applyPrefixRenames = (id: string) =>
  renamedPrefixes.reduce(
    (current, [from, to]) => (current.startsWith(from) ? `${to}${current.slice(from.length)}` : current),
    id,
  );

const parseReference = (text: string) => {
  const rules = new Map<string, ReferenceRule>();
  const linePattern = /^([EW]) (\S+)(?: (.*))?$/;

  for (const line of text.split('\n')) {
    const match = linePattern.exec(line);

    if (!match) {
      continue;
    }

    const [, flag, upstreamId, rawOptions] = match;

    rules.set(applyPrefixRenames(upstreamId ?? ''), {
      severity: flag === 'E' ? 'error' : 'warn',
      options: rawOptions === undefined ? undefined : (JSON.parse(rawOptions) as unknown[]),
    });
  }

  return rules;
};

const severityName = (value: unknown) => {
  if (value === 2 || value === 'error') {
    return 'error';
  }

  if (value === 1 || value === 'warn') {
    return 'warn';
  }

  return 'off';
};

const normalizeRule = (entry: unknown) => {
  const [severity, ...options] = Array.isArray(entry) ? entry : [entry];

  return { severity: severityName(severity), options };
};

// ESLint fills in `meta.defaultOptions` when it computes a file's config, so the upstream options must be a
// subset of what ESLint reports rather than an exact copy.
const expectOptionsToMatch = (id: string, actual: unknown[], expected: unknown[]) => {
  for (const [index, expectedOption] of expected.entries()) {
    const label = `${id} option ${index}`;

    if (expectedOption !== null && typeof expectedOption === 'object') {
      expect(actual[index], label).toMatchObject(expectedOption);
    } else {
      expect(actual[index], label).toEqual(expectedOption);
    }
  }
};

describe('rule parity with the upstream effective config', () => {
  it('enables exactly the upstream rule set, with the same severities and options, for package sources', async () => {
    const reference = parseReference(readFileSync(referencePath, 'utf8'));
    const eslint = new ESLint({ cwd: repoRoot });
    const config = (await eslint.calculateConfigForFile('packages/open-mushroom/src/react/mushroom.tsx')) as {
      rules: Record<string, unknown>;
    };
    const enabled = new Map(
      Object.entries(config.rules)
        .map(([id, entry]) => [id, normalizeRule(entry)] as const)
        .filter(([, rule]) => rule.severity !== 'off'),
    );

    // Every upstream rule maps to itself or to its documented replacements, each with the upstream severity.
    const expected = new Map<string, ReferenceRule>();

    for (const [id, rule] of reference) {
      const targets = renamedRules[id] ?? [id];

      for (const target of targets) {
        expected.set(target, target === id ? rule : { ...rule, options: undefined });
      }
    }

    expect(reference.size).toBe(430);
    expect([...enabled.keys()].filter((id) => !expected.has(id))).toEqual([]);
    expect([...expected.keys()].filter((id) => !enabled.has(id))).toEqual([]);

    for (const [id, rule] of expected) {
      const actual = enabled.get(id);

      expect(actual?.severity, `${id} severity`).toBe(rule.severity);

      if (!optionsExempt.has(id) && rule.options !== undefined) {
        expectOptionsToMatch(id, actual?.options ?? [], rule.options);
      }
    }
  });
  it('keeps the raw rule maps identical to the upstream reference, options included, except the documented renames', () => {
    const reference = parseReference(readFileSync(referencePath, 'utf8'));
    const maps: Record<string, unknown> = {
      ...coreRules,
      ...typescriptRules,
      ...reactRules,
      ...jsxA11yRules,
      ...unicornRules,
      ...sonarjsRules,
      ...importRules,
    };
    const replacementIds = new Set(Object.values(renamedRules).flat());

    for (const [id, rule] of reference) {
      if (optionsExempt.has(id)) {
        continue;
      }

      const targets = renamedRules[id];

      if (targets) {
        for (const target of targets) {
          expect(Object.hasOwn(maps, target), `${target} replaces ${id}`).toBe(true);
        }

        continue;
      }

      expect(normalizeRule(maps[id]), id).toEqual({ severity: rule.severity, options: rule.options ?? [] });
    }

    for (const id of Object.keys(maps)) {
      expect(reference.has(id) || replacementIds.has(id), `${id} is upstream or a documented replacement`).toBe(true);
    }
  });
});
