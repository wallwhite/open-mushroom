import type { Linter } from 'eslint';

/**
 * Per-area deltas on top of the base rule set. Each map mirrors an upstream override block:
 * tests relax strictness for fixtures and mocks, tooling allows console output and dev-only imports,
 * declaration files skip import/any checks, and the lint config itself is exempt from literal-count rules.
 */
export const testOverrides: Linter.RulesRecord = {
  '@typescript-eslint/no-explicit-any': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  '@typescript-eslint/no-non-null-assertion': 'off',
  '@typescript-eslint/require-await': 'off',
  '@typescript-eslint/unbound-method': 'off',
  'func-names': 'off',
  'import-x/no-extraneous-dependencies': 'off',
  'no-invalid-this': 'off',
  'no-magic-numbers': 'off',
  'no-promise-executor-return': 'off',
  'sonarjs/no-duplicate-string': 'off',
  'unicorn/no-useless-undefined': 'off',
};

export const toolingOverrides: Linter.RulesRecord = {
  'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
  'import-x/no-unassigned-import': 'off',
  // CLI tools process items sequentially on purpose (ordered pipelines, rate limits).
  'no-await-in-loop': 'off',
  'no-console': 'off',
  'no-magic-numbers': 'off',
  'sonarjs/cognitive-complexity': 'off',
  // Cut tables and QA scripts repeat slot names and selectors by design; a constant per name would hide the data.
  'sonarjs/no-duplicate-string': 'off',
  'unicorn/no-await-expression-member': 'off',
  'unicorn/no-process-exit': 'off',
};

export const declarationOverrides: Linter.RulesRecord = {
  '@typescript-eslint/no-explicit-any': 'off',
  'import-x/no-unassigned-import': 'off',
};

export const lintConfigOverrides: Linter.RulesRecord = {
  'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
  'no-magic-numbers': 'off',
  'sonarjs/no-duplicate-string': 'off',
};
