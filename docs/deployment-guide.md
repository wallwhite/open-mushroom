# Deployment guide

## Development Environment

**Requirements:**
- Node 22 (pinned in `.nvmrc`)
- pnpm 10.34.5 (pinned in `package.json` `packageManager`)
- Enforced via `engines` in root package.json

**Setup:**
```bash
nvm use          # Node 22 from .nvmrc
pnpm install     # pnpm 10
pnpm check       # lint, format, typecheck, test (all run build:package first)
```

## Package Build & Bundling

**Toolchain:** tsdown ~0.21.10 (rolldown-based bundler)

**Output:** ESM-only with types, declarations, and sourcemaps to `dist/`

**Entries:**
- `index.js` (client, retains `'use client'` directive)
- `core.js` (server-safe, no directives)
- `mushroom.css` (copied from src/styles)

**Peers never bundled:** react ^19, react-dom ^19, gsap ^3.13

**Quality gates** (`pnpm lint:package`):
- publint: package export compliance
- arethetypeswrong: ESM-only profile (CSS entry excluded)
- size-limit: gzip budget 115 kB for `import { Mushroom }` (currently ~98 kB)
- typecheck:consumer: smoke test against built declarations

## Lab Deployment (Next.js)

**Hosting:** Vercel

**Configuration:**
- Root directory: `apps/lab`
- Build: `pnpm install` → `pnpm build` (runs build:package first)
- Node version: 22 (set via `.nvmrc`)

## npm Release Workflow

**Versioning:** Semantic versioning via Changesets

**First release (0.1.0):** Manual
```bash
pnpm changeset version      # Bump version, update CHANGELOG
git add -A && git commit    # Commit version changes
npm login                   # Interactive login
pnpm --filter open-mushroom publish --access public --no-provenance
```

**Subsequent releases:** Automated GitHub Actions workflow
1. Changesets action opens "Version Packages" pull request on push to main
2. Once merged, publish job runs (requires `NPM_PUBLISH_ENABLED` repository variable)
3. Uses OIDC trusted publishing (npm 11.19.1, provenance enabled, audit before publish)

**GitHub setup:** Create `npm-release` environment; enable "Allow GitHub Actions to create and approve pull requests"
