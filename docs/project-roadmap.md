# Project roadmap

Living document tracking progress toward v0.1.0 and beyond.

## v0.1.0 Milestones

1. **Monorepo & tooling** ✓ Complete
   - pnpm workspaces, TypeScript 5.9.3, ESLint 9, Vitest 5, Prettier 3.9
   - GitHub Actions CI (lint, format, typecheck, test)
   - husky + lint-staged pre-commit hook

2. **Skeleton data model** ✓ Complete
   - SVG source → character rig data model (track A)
   - Manifests generated for all emotions and idle states

3. **Package core rig** ✓ Complete
   - Core rig (React-free animations, constants, helpers)
   - React components and hooks (`Mushroom`, `MushroomSpeechBubble`)
   - Public API: 8 types + 2 components

4. **Skeleton pipeline** (in progress)
   - SVG-to-manifest build tooling (track B)
   - Zod schema validation for manifests
   - Source checksum validation

5. **Package bundling & release** ✓ Complete
   - tsdown bundler: two ESM entries, declarations, sourcemaps
   - Package exports: `.`, `./core`, `./styles.css`, `./package.json`
   - Changesets versioning + CHANGELOG automation
   - GitHub Actions: Version pull request + automated npm publish (OIDC trusted)
   - Quality gates: publint, arethetypeswrong, size-limit (115 kB gzip budget)

6. **Lab app shell** ✓ Complete
   - Next.js 16 with next-intl 4.14 i18n routing
   - Dynamic locale routes (`/` en, `/uk` uk) with hreflang alternates
   - Full-width header and footer with locale switcher
   - Marketplace-ready URL locale detection (Accept-Language → redirect)
   - SSG pages with robots.txt and sitemap.xml
   - Dev HMR with workspace package aliasing, production consumption via compiled dist
   - 91 tests passing (routing, message parity, all quality gates green)
   - Placeholder page (lab controls added in phase 6)

7. **Lab page** (planned)
   - Interactive Mushroom controls (emotion, size, speech bubble)
   - Live code examples and snippets
   - Performance and layout testing

8. **Docs page** (planned)
   - API reference (types, components, hooks)
   - Integration guides
   - Accessibility audits and QA

## Post-v0.1

- Presence layer (state machine, taunts)
- Per-emotion code splitting
- Vanilla `createMushroomSvg()` (non-React)
- ESLint 10 upgrade
- Community templates, code of conduct
