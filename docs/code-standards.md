# Code standards

## TypeScript

- **Version:** 5.9.3 (workspace catalog)
- **Strict mode:** `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noImplicitOverride`
- **Target:** ES2022, module resolution `bundler`

## Linting & Formatting

- **ESLint 9.39.5** flat config (`eslint.config.ts` via jiti)
  - Maps upstream rule set 1:1 (`eslint/reference/upstream-effective-rules.txt`)
  - Nine deprecated rules remapped (`eslint/rule-renames.ts`)
  - Overrides for tests, tooling, declarations, lint config
  - Parity tests: `config-smoke.test.ts`, `rules-parity.test.ts`
- **Prettier 3.9:** single quotes, semicolons, width 120, trailing commas, packagejson plugin

## Code Patterns

- Kebab-case filenames, max 200 lines, one concern per file
- Colocated tests (`*.test.ts`); fixtures in `fixtures/`
- Layer-first module layout
- Comments explain invariants and trade-offs, not obvious code
- No local paths, plan references, or tool names in code

## Git Hygiene

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Never commit `.env`, keys, tokens, or secrets
- Clean, focused commits on actual changes
