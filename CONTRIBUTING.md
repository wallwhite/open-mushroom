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

All package updates require a changeset:

```bash
pnpm changeset    # Select patch/minor/major, write summary
git add .changeset && git commit -m "chore: add changeset"
```

**First release (0.1.0):** Manual

```bash
pnpm changeset version && npm login && pnpm --filter open-mushroom publish --access public --no-provenance
```

**Subsequent releases:** Push to main. The workflow automatically opens a "Version Packages" pull request; once merged, publishing happens automatically (OIDC-verified, no tokens).
