# Deployment guide

## Development Environment

**Requirements:**
- Node 22 (pinned in `.nvmrc`)
- pnpm 10.34.5 (pinned in `package.json` `packageManager`)
- Enforced via `engines` in root package.json and `.npmrc` engine-strict

**Setup:**
```bash
nvm use          # Node 22 from .nvmrc
pnpm install     # pnpm 10
pnpm check       # lint, format, typecheck, test (all run build:package first)
```

## Lab Deployment (Next.js)

**Hosting:** Vercel

**Configuration:**
- Root directory: `apps/lab`
- Build: `pnpm install` → `pnpm build` (runs build:package first)
- Node version: 22 (set via `.nvmrc`)
- Install command: pnpm install (Vercel auto-detects pnpm via packageManager)

## Package Release (npm)

**Versioning:**
- Semantic versioning via Changesets (pnpm changeset)
- CHANGELOG.md generated at release time

**Publishing:**
- First release (0.1.0): manual
- Subsequent releases: automated workflow (in progress)
- **Security:** No long-lived npm tokens; use 2FA-only trusted publishing

**Minimum age:** 4320 minutes (3 days) cooldown for freshly published dependencies
