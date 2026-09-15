import { fileURLToPath } from 'node:url';

import { ESLint } from 'eslint';
import { describe, expect, it } from 'vitest';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));

// Every plugin must contribute at least one hit, otherwise a silently unloaded plugin would go unnoticed.
const expectedRuleIds = [
  'no-console',
  'import-x/order',
  '@typescript-eslint/no-explicit-any',
  'unicorn/throw-new-error',
  'sonarjs/no-collapsible-if',
  'react/jsx-key',
  'react-hooks/rules-of-hooks',
  'jsx-a11y/alt-text',
  '@typescript-eslint/no-restricted-types',
];

// Fixtures are globally ignored so `eslint .` stays green; the tests lint them explicitly.
const createEslint = () => new ESLint({ cwd: repoRoot, ignore: false });

const lintFixture = async (fileName: string) => {
  const [result] = await createEslint().lintFiles([`eslint/fixtures/${fileName}`]);

  if (!result) {
    throw new Error(`ESLint returned no result for ${fileName}`);
  }

  return result;
};

const unknownRuleMessages = (messages: ESLint.LintResult['messages']) =>
  messages.filter((message) => message.message.startsWith('Definition for rule'));

describe('eslint config', () => {
  it('reports the expected rules on a file with deliberate violations', async () => {
    const result = await lintFixture('violations.tsx');
    const ruleIds = new Set(result.messages.map((message) => message.ruleId));

    expect(unknownRuleMessages(result.messages)).toEqual([]);
    expect(result.messages.filter((message) => message.fatal)).toEqual([]);

    for (const ruleId of expectedRuleIds) {
      expect(ruleIds, `expected ${ruleId} to be reported`).toContain(ruleId);
    }
  });

  it('reports nothing on a clean component', async () => {
    const result = await lintFixture('clean.tsx');

    expect(result.messages).toEqual([]);
  });

  it('runs prettier through the prettier rule on files prettier does not ignore', async () => {
    // The violations fixture is prettier-ignored (so `prettier --check` passes), so probe with inline source instead.
    const [result] = await createEslint().lintText('export const probe = "double quotes";\n', {
      filePath: 'eslint/fixtures/clean.tsx',
    });
    const ruleIds = new Set(result?.messages.map((message) => message.ruleId));

    expect(ruleIds).toContain('prettier/prettier');
  });
});
