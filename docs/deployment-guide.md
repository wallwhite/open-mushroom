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

## Lab App (Next.js 16)

### Local Development

**Run the lab with live package HMR:**
```bash
pnpm dev              # Starts: build:package → concurrently (package dev + lab dev)
# Lab server: http://localhost:3001
```

**Locale behavior:**
- `/` → English (default)
- `/uk` → Ukrainian
- `/de` → 404 (unsupported locale)
- Accept-Language header respected: `curl -H 'Accept-Language: uk-UA' http://localhost:3001/` redirects to `/uk`

**Environment variables** (optional, for site URLs):
- `APP_URL`: Public site URL (used in robots.ts, sitemap.ts, metadata canonicals; defaults to localhost)

### Hosting the Lab

The lab is a standard Next.js app; any Node host works. Hosting is not chosen yet.

- Build from the repository root with `pnpm build` (compiles the package first, then the lab)
- Install with `pnpm install --frozen-lockfile` on Node 22 (`.nvmrc`)
- Set `APP_URL` to the public origin; without it the canonical links, hreflang alternates, robots and sitemap point at `http://localhost:3001`

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
