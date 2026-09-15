# Code standards

## TypeScript

- **Version:** 5.9.3 (managed in workspace catalog)
- **Strict mode:** `strict: true` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noImplicitOverride`
- **Target:** ES2022, module resolution `bundler`

## Linting & Formatting

- **ESLint 9.39.5** flat config (`eslint.config.ts` loaded via jiti)
  - Mirrors upstream rule set 1:1 (reference: `eslint/reference/upstream-effective-rules.txt`)
  - Nine deprecated rules remapped to new names (see `eslint/rule-renames.ts`)
  - Override blocks: tests, tooling, declaration files, lint config itself
  - Tests: `eslint/config-smoke.test.ts` and `eslint/rules-parity.test.ts`
- **Prettier 3.9:** single quotes, semicolons, width 120, trailing commas, `prettier-plugin-packagejson`

## File Conventions

- Kebab-case filenames; keep under 200 lines; one concern per file
- Colocated tests (`*.test.ts` next to code); fixtures in `fixtures/` directories
- Layer-first module layout
- Comments explain *why*, not *what*; no local paths or tool references

## Commits

- Conventional format: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- No AI references; never commit secrets, tokens, or `.env` files
