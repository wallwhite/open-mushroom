# Project roadmap

Living document tracking progress toward v0.1.0 and beyond.

## v0.1.0 Milestones

1. **Monorepo & tooling** ✓ Complete
   - pnpm workspaces, TypeScript 5.9.3, ESLint 9, Vitest 5, Prettier 3.9
   - GitHub Actions CI (lint, format, typecheck, test)
   - husky + lint-staged pre-commit hook

2. **Skeleton pipeline** (in progress)
   - SVG source → character rig data model
   - Build output: manifests for all emotions and idle states

3. **Package & components** (planned)
   - Core rig (React-free)
   - React components and hooks
   - Speech bubble
   - Bundle and package.json publish contract

4. **Changesets & release** (planned)
   - Changeset workflow for semantic versioning
   - Automated CHANGELOG generation
   - npm publishing with 2FA

5. **Lab playground** (planned)
   - Next.js app with i18n (English, Ukrainian)
   - Interactive emotion / size / idle picker

6. **Documentation site** (planned)
   - Live code examples (MDX)
   - API reference, guides, gallery

7. **CI & QA** (planned)
   - Visual regression testing
   - Lighthouse checks, accessibility audits

## Post-v0.1

- Presence layer (state machine, taunts)
- Per-emotion code splitting
- Vanilla `createMushroomSvg()` (non-React)
- ESLint 10 upgrade (requires @eslint-react, TypeScript 7 bump)
- Community templates, code of conduct, issue/PR templates
