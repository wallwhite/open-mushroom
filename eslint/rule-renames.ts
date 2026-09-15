/**
 * Upstream rule ids that no longer exist in the installed plugin majors, mapped to their replacements.
 * An empty list means the rule was removed upstream without a replacement. The parity test uses this map to
 * compare the effective config against reference/upstream-effective-rules.txt; the rules-*.ts files carry the
 * same replacements inline.
 */
export const renamedRules: Record<string, readonly string[]> = {
  '@typescript-eslint/ban-types': [
    '@typescript-eslint/no-wrapper-object-types',
    '@typescript-eslint/no-unsafe-function-type',
    '@typescript-eslint/no-empty-object-type',
    '@typescript-eslint/no-restricted-types',
  ],
  '@typescript-eslint/no-throw-literal': ['@typescript-eslint/only-throw-error'],
  '@typescript-eslint/no-useless-template-literals': ['@typescript-eslint/no-unnecessary-template-expression'],
  'sonarjs/no-one-iteration-loop': [],
  'unicorn/better-regex': [],
  'unicorn/no-array-push-push': ['unicorn/prefer-single-call'],
  'unicorn/no-hex-escape': ['unicorn/prefer-unicode-code-point-escapes'],
  'unicorn/no-instanceof-array': ['unicorn/no-instanceof-builtins'],
  'unicorn/prefer-dom-node-dataset': ['unicorn/dom-node-dataset'],
};
