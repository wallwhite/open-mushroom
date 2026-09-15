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

## Manifest Generation

**Rebuild manifests from Figma exports:**
```bash
pnpm --filter open-mushroom mushroom:build              # Rebuild, validate gates, exit 1 if any fail
pnpm --filter open-mushroom mushroom:build --debug      # Also write debug PNGs to .mushroom-debug/
pnpm --filter open-mushroom mushroom:build --report out.md  # Write gate metrics as markdown
```

**Verify manifests match committed versions (CI gate):**
```bash
pnpm mushroom:check       # At root (all workspaces) or package level
                          # = mushroom:build + git diff --exit-code on generated files
```

**When to rebuild:** Anytime `assets/source/*.svg` or `tools/skeleton/cut-plan.ts` changes. Always regenerate and commit the manifests together with any source changes.

**Development note:** paper.js resolves `jsdom` via bare require, which in this workspace would otherwise pick up jsdom 27 (from React test dependencies) whose window cannot be removed. `pnpm-workspace.yaml` packageExtensions pins paper to jsdom ^16.7.0 (via paper-jsdom). This is a dev-only concern; the build pipeline never runs in production.

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
