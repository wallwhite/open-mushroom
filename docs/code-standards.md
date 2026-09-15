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

## Next.js 16 Lab App Conventions

- **Proxy middleware (next-intl):** `proxy.ts` exports `default` and `config.matcher` as string literals (imports break dev server)
- **Dynamic params:** Layout and page functions receive `params` as a Promise; await before use
- **Static generation:** Use `generateStaticParams()` to pre-render all locale variants; SSG pages avoid dynamic `getRequestLocale` calls
- **Message files:** i18n messages live in `messages/{locale}.json` by locale, never hardcoded in components
- **Workspace package in dev:** `next.config.ts` conditional `turbopack.resolveAlias` (dev only); relative paths from app root (absolute paths fail)
- **Package prerequisite:** Root `dev` script runs `pnpm build:package` before starting the lab to ensure types are available for ESLint/TypeScript

## Toolchain

**Node version enforcement:**
- Root `engines` enforced by pnpm (>=22)
- `.npmrc` sets `engine-strict=false` because transitive dev tooling (ast-kit 3, Babel 8 pre-releases) declares Node >=22.18 while dev machines may run older Node 22
- CI uses latest Node 22 from `.nvmrc`
- Upgrade local Node to 22.18+ to enable strict mode

## Git Hygiene

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Never commit `.env`, keys, tokens, or secrets
- Clean, focused commits on actual changes
