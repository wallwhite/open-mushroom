import type { Linter } from 'eslint';

/**
 * sonarjs rules, ported 1:1 from the upstream effective config (reference/upstream-effective-rules.txt).
 * Ids that changed between plugin majors are listed in rule-renames.ts.
 */
export const sonarjsRules: Linter.RulesRecord = {
  'sonarjs/no-duplicate-string': ['warn', { threshold: 5, ignoreStrings: 'application/json' }],
  'sonarjs/cognitive-complexity': 'error',
  'sonarjs/max-switch-cases': 'error',
  'sonarjs/no-all-duplicated-branches': 'error',
  'sonarjs/no-collapsible-if': 'error',
  'sonarjs/no-collection-size-mischeck': 'error',
  'sonarjs/no-duplicated-branches': 'error',
  'sonarjs/no-element-overwrite': 'error',
  'sonarjs/no-empty-collection': 'error',
  'sonarjs/no-extra-arguments': 'error',
  'sonarjs/no-gratuitous-expressions': 'error',
  'sonarjs/no-identical-conditions': 'error',
  'sonarjs/no-identical-expressions': 'error',
  'sonarjs/no-identical-functions': 'error',
  'sonarjs/no-ignored-return': 'error',
  'sonarjs/no-nested-switch': 'error',
  'sonarjs/no-nested-template-literals': 'error',
  // no-one-iteration-loop (S1751) was removed from eslint-plugin-sonarjs 1.x; no replacement.
  'sonarjs/no-redundant-boolean': 'error',
  'sonarjs/no-redundant-jump': 'error',
  'sonarjs/no-same-line-conditional': 'error',
  'sonarjs/no-small-switch': 'error',
  'sonarjs/no-unused-collection': 'error',
  'sonarjs/no-use-of-empty-return-value': 'error',
  'sonarjs/no-useless-catch': 'error',
  'sonarjs/non-existent-operator': 'error',
  'sonarjs/prefer-immediate-return': 'error',
  'sonarjs/prefer-object-literal': 'error',
  'sonarjs/prefer-single-boolean-return': 'error',
  'sonarjs/prefer-while': 'error',
};
