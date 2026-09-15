import type { Linter } from 'eslint';

/**
 * import rules, ported 1:1 from the upstream effective config (reference/upstream-effective-rules.txt).
 * Ids that changed between plugin majors are listed in rule-renames.ts.
 */
export const importRules: Linter.RulesRecord = {
  'import-x/order': [
    'error',
    {
      alphabetize: { order: 'asc', caseInsensitive: true, orderImportKind: 'ignore' },
      pathGroups: [
        { pattern: 'react', group: 'builtin', position: 'before' },
        { pattern: 'react*', group: 'builtin' },
        { pattern: '@react*', group: 'builtin', position: 'after' },
        { pattern: '@/assets/**', group: 'internal', position: 'after' },
        { pattern: '@/lib/**', group: 'internal', position: 'after' },
        { pattern: '@/modules/**', group: 'internal', position: 'after' },
        { pattern: '@/components/**', group: 'internal', position: 'after' },
        { pattern: './*.scss', group: 'object', position: 'after' },
      ],
      pathGroupsExcludedImportTypes: ['react'],
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
      distinctGroup: true,
      named: false,
      warnOnUnassignedImports: false,
    },
  ],
  'import-x/first': 'error',
  'import-x/newline-after-import': 'error',
  'import-x/no-absolute-path': 'error',
  'import-x/no-cycle': 'error',
  'import-x/no-extraneous-dependencies': [
    'error',
    {
      includeTypes: true,
      devDependencies: [
        'test/**',
        'tests/**',
        'spec/**',
        '**/__tests__/**',
        '**/__mocks__/**',
        'test.{js,jsx,ts,tsx}',
        'test-*.{js,jsx,ts,tsx}',
        '**/*{.,_}{test,spec}.{js,jsx,ts,tsx}',
        '**/jest.config.js',
        '**/jest.setup.js',
        '**/vite.config.ts',
        '**/vite.config.js',
        '**/vue.config.js',
        '**/webpack.config.js',
        '**/webpack.config.*.js',
        '**/rollup.config.js',
        '**/rollup.config.*.js',
        '**/.eslintrc.js',
        '**/.eslintrc.cjs',
      ],
      optionalDependencies: false,
    },
  ],
  'import-x/no-mutable-exports': 'error',
  'import-x/no-relative-packages': 'warn',
  'import-x/no-self-import': 'error',
  'import-x/no-useless-path-segments': 'error',
  'import-x/no-named-as-default': 'error',
  'import-x/no-named-as-default-member': 'error',
  'import-x/no-deprecated': 'warn',
  'import-x/no-duplicates': 'error',
  'import-x/no-dynamic-require': 'error',
  'import-x/no-unassigned-import': ['warn', { allow: ['**/*.css', '**/*.scss', '**/*.sass'] }],
  'import-x/no-named-default': 'error',
  'import-x/no-anonymous-default-export': [
    'warn',
    {
      allowArray: false,
      allowArrowFunction: false,
      allowAnonymousClass: false,
      allowAnonymousFunction: false,
      allowLiteral: false,
      allowObject: false,
    },
  ],
};
