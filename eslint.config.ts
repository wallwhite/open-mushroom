import { readFileSync } from 'node:fs';

import nextPlugin from '@next/eslint-plugin-next';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettierPlugin from 'eslint-plugin-prettier';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import sonarjs from 'eslint-plugin-sonarjs';
import unicorn from 'eslint-plugin-unicorn';
import type { ESLint } from 'eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { coreRules } from './eslint/rules-core';
import { importRules } from './eslint/rules-import';
import { jsxA11yRules } from './eslint/rules-jsx-a11y';
import { declarationOverrides, lintConfigOverrides, testOverrides, toolingOverrides } from './eslint/rules-overrides';
import { reactRules } from './eslint/rules-react';
import { sonarjsRules } from './eslint/rules-sonarjs';
import { typescriptRules } from './eslint/rules-typescript';
import { unicornRules } from './eslint/rules-unicorn';

// Prettier options live in one place; the ESLint rule reads the same file Prettier itself reads.
const prettierOptions = JSON.parse(readFileSync(new URL('./.prettierrc.json', import.meta.url), 'utf8')) as Record<
  string,
  unknown
>;

const sourceFiles = ['**/*.{ts,tsx,mts,cts}'];
const testFiles = [
  '**/*.test.ts',
  '**/*.test.tsx',
  '**/*.spec.ts',
  '**/*.spec.tsx',
  '**/test/**/*.ts',
  '**/test/**/*.tsx',
  '**/*-test-setup.ts',
];

export default defineConfig([
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/.next/**',
    '**/coverage/**',
    '**/generated/**',
    '**/next-env.d.ts',
    '*.config.js',
    '*.config.cjs',
    '*.config.mjs',
    '**/*.config.ts',
    'plans/**',
    'docs/**',
    '.claude/**',
    'eslint/fixtures/**',
    'release-manifest.json',
  ]),
  {
    name: 'open-mushroom/base',
    files: sourceFiles,
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      'import-x': importX,
      'jsx-a11y': jsxA11y,
      prettier: prettierPlugin,
      react,
      'react-hooks': reactHooks as unknown as ESLint.Plugin,
      sonarjs,
      unicorn,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2024 },
    },
    settings: {
      react: { version: 'detect' },
      'import-x/extensions': ['.js', '.jsx', '.mts', '.tsx', '.mjs', '.cjs'],
      'import-x/external-module-folders': ['node_modules', 'node_modules/@types'],
      'import-x/parsers': { '@typescript-eslint/parser': ['.ts', '.cts', '.mts', '.tsx'] },
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: ['tsconfig.json', 'packages/*/tsconfig.json', 'apps/*/tsconfig.json'],
          noWarnOnMultipleProjects: true,
        }),
      ],
    },
    rules: {
      ...coreRules,
      ...unicornRules,
      ...sonarjsRules,
      ...importRules,
      ...typescriptRules,
      ...reactRules,
      ...jsxA11yRules,
      'prettier/prettier': ['error', prettierOptions],
    },
  },
  {
    name: 'open-mushroom/lab-next',
    files: ['apps/lab/**/*.{ts,tsx}'],
    plugins: { '@next/next': nextPlugin },
    settings: { next: { rootDir: 'apps/lab' } },
    rules: { ...nextPlugin.configs['core-web-vitals'].rules },
  },
  {
    name: 'open-mushroom/lint-config',
    files: ['eslint/**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.node } },
    rules: lintConfigOverrides,
  },
  {
    name: 'open-mushroom/tooling',
    files: ['**/tools/**/*.ts', '**/scripts/**/*.ts', '**/qa/**/*.ts'],
    languageOptions: { globals: { ...globals.node } },
    rules: toolingOverrides,
  },
  {
    name: 'open-mushroom/tests',
    files: testFiles,
    languageOptions: { globals: { ...globals.node } },
    rules: testOverrides,
  },
  {
    name: 'open-mushroom/declarations',
    files: ['**/*.d.ts'],
    rules: declarationOverrides,
  },
]);
