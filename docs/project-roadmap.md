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

4. **Skeleton pipeline** ✓ Complete
   - SVG-to-manifest build tooling: seven emotions + hat, 24-slot knife cuts, pupil geometry, outline normalization
   - Deterministic JSON output (sha256 validation, byte-identical across runs)
   - Zod schema validation for manifests; hand-written types for public API
   - Pixel-level raster gates (mismatch ≤0.5%, blobs ≤40 px², pupil ratios); all 7 emotions pass
   - `pnpm mushroom:build` and `pnpm mushroom:check` CLI ready for development and CI

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
   - CI integration pending: `mushroom:check` wiring into GitHub Actions

7. **Lab page (Interactive Playground)** ✓ Complete
   - Four control panels: Emotions (7 emotion buttons), Idle life (blink/gaze/breathe/shimmer/talking + blink-now/look-centre), Speech bubble (demo line set + preview trigger), Scene (size/background/overlay/onion-skin)
   - Character preview with optional speech bubble positioned above
   - Call-to-action row: documentation link and npm install snippet (Clipboard API with fallback)
   - Debug overlay: slot labels, pivots, clips with computed SVG geometry
   - Headless QA interface (`window.__mushroomLab`): holdAt (pause animations at progress), pageActiveTweens, emotion/size/mount/bubble control, snapshot()
   - Responsive layout: preview + aside on lg, stacked below on mobile
   - 20 tests green (reducer, message parity, bubble lines ≤70 chars)

8. **Docs page** (planned)
   - API reference (types, components, hooks, core constants)
   - Integration guides and examples
   - Accessibility audit results and QA methodology

## Post-v0.1

- Presence layer (state machine, taunts)
- Per-emotion code splitting
- Vanilla `createMushroomSvg()` (non-React)
- ESLint 10 upgrade
- Community templates, code of conduct
