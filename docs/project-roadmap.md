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

5. **Package bundling & release** (planned)
   - Bundle configuration (ESM + types)
   - Changesets + CHANGELOG automation
   - npm publishing workflow

6. **Lab playground** (planned)
   - Next.js playground with interactive controls
   - Bilingual docs (English, Ukrainian)
   - Live code examples

7. **Documentation & QA** (planned)
   - API reference, guides, gallery
   - Visual regression testing
   - Accessibility audits

## Post-v0.1

- Presence layer (state machine, taunts)
- Per-emotion code splitting
- Vanilla `createMushroomSvg()` (non-React)
- ESLint 10 upgrade
- Community templates, code of conduct
