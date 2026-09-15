# Contributing

## Environment

**Requires:** Node 22, pnpm 10.34.5 (see `.nvmrc` and `package.json`)

```bash
nvm use
pnpm install
pnpm check       # Runs lint, format, typecheck, test (all call build:package first)
```

## Development

**Common tasks:**

- `pnpm dev` — Lab dev server (package consumed from source, live reload)
- `pnpm build` — Monorepo build (package first, then lab)
- `pnpm lint` / `pnpm lint:fix` — ESLint with flat config (430+ rules, see `eslint/`)
- `pnpm format` / `pnpm format:fix` — Prettier (120 width, single quotes, trailing commas)
- `pnpm typecheck` — TypeScript strict mode
- `pnpm test` / `pnpm test:watch` — Vitest (ESLint config tests in `tooling` project)

## Code Conventions

- **Files:** kebab-case, under 200 lines each; colocated tests (`*.test.ts`)
- **Commits:** Conventional format (`feat:`, `fix:`, `docs:`, etc.); no AI references
- **TypeScript:** Strict mode with `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc.
- **Comments:** Explain _why_, not _what_; no local paths or tool references
- **No secrets:** Never commit `.env`, tokens, or machine paths

## Releases

Package updates require a changeset:

```bash
pnpm changeset    # Select patch/minor/major + write summary
```

CHANGELOG and version are auto-generated at release time. First release (0.1.0) is manual; later releases use the automated workflow.
