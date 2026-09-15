# Code standards

## TypeScript

- **Version:** 5.9.3 (workspace catalog)
- **Strict mode:** `strict: true`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `noImplicitOverride`
- **Target:** ES2022, module resolution `bundler`

## Linting & Formatting

- **ESLint 9.39.5** flat config (`eslint.config.ts` via jiti)
  - Maps upstream rule set 1:1 (`eslint/reference/upstream-effective-rules.txt`)
  - Nine deprecated rules remapped (`eslint/rule-renames.ts`)
  - Overrides for tests, tooling, declarations, lint config (`eslint/rules-overrides.ts`)
  - Parity tests: `config-smoke.test.ts`, `rules-parity.test.ts`
- **Tooling overrides** (`tools/**`, `scripts/**`, `qa/**`): `import-x/no-extraneous-dependencies` allows devDeps, `no-await-in-loop` off (sequential processing), `no-console` off, `sonarjs/no-duplicate-string` off (cut plans repeat slot names by design)
- **Prettier 3.9:** single quotes, semicolons, width 120, trailing commas, packagejson plugin
  - `.prettierignore` excludes `.mushroom-debug/` (build pipeline debug output)

## Code Patterns

- Kebab-case filenames, max 200 lines, one concern per file
  - **Exceptions:** `tools/skeleton/cut-plan.ts` (270 lines, knife geometry algorithm non-separable), `tools/skeleton/normalize-path-start.ts` (221 lines, SVG path normalization non-separable). Both must maintain output determinism.
- Colocated tests (`*.test.ts`); fixtures in `fixtures/`
- Layer-first module layout
- Comments explain invariants and trade-offs, not obvious code
- No local paths, plan references, or tool names in code
- Build pipeline modules (`tools/skeleton/`) anchor on `import.meta.dirname`, never on `process.cwd()` — ensuring portability across working directories

## Next.js 16 Lab App Conventions

- **Proxy middleware (next-intl):** `proxy.ts` exports `default` and `config.matcher` as string literals (imports break dev server)
- **Dynamic params:** Layout and page functions receive `params` as a Promise; await before use
- **Static generation:** Use `generateStaticParams()` to pre-render all locale variants; SSG pages avoid dynamic `getRequestLocale` calls
- **Message files:** i18n messages live in `messages/{locale}.json` by locale, never hardcoded in components
- **Workspace package in dev:** `next.config.ts` conditional `turbopack.resolveAlias` (dev only); relative paths from app root (absolute paths fail)
- **Package prerequisite:** Root `dev` script runs `pnpm build:package` before starting the lab to ensure types are available for ESLint/TypeScript

## Lab Module Conventions

- **UI copy:** All UI strings (labels, hints, button text) live in `messages.lab` namespace; no hardcoded English or other languages in component files
- **No Cyrillic in sources:** Module source files contain no Cyrillic characters outside of comments (tests and `messages.json` are exceptions)
- **Core-only imports:** Lab components import from `open-mushroom` (components, types) and `open-mushroom/core` (constants, helpers); no deep package imports
- **Headless API:** Methods exposed on `window.__mushroomLab` are not semver-protected; used by QA/CI scripts only

## Documentation Module Conventions

- **MDX plugins by name:** Under Turbopack, `@next/mdx` requires plugin strings (`'remark-gfm'`, `'rehype-slug'`); functions cannot be passed and options must be JSON-serializable, so highlighting is done in the component map instead of a rehype plugin
- **Content location:** MDX pages live in `apps/lab/src/content/docs/{locale}/{slug}.mdx` by locale; no hardcoded Cyrillic outside Ukrainian content
- **Examples:** Live in `apps/lab/src/modules/docs/examples/{name}.tsx`; each uses only public API (`open-mushroom` + `open-mushroom/core`); max 60 lines, `'use client'` directive required
- **UI copy:** All UI strings (sidebar, pager, preview tabs, copy button, edit link) live in `messages.docs` namespace by feature; no hardcoded UI text in components
- **Registry safety:** `docs-registry.ts` uses `Map<slug, { en, uk }>` (not plain object) to prevent prototype-key attacks; `hasDoc(slug)` gates route resolution; `[slug]/page.tsx` sets `dynamicParams = false`
- **RSC boundaries:** `component-preview.tsx` (RSC) reads file system; `PreviewTabs` and `CopyButton` are client components with event handlers

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
