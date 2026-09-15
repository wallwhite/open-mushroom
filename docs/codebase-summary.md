# Codebase summary

## Monorepo Layout

```
open-mushroom/
├── packages/
│   └── open-mushroom/src/
│       ├── core/             # Rig, animations, constants, helpers, types
│       ├── react/            # React components, hooks, utilities
│       ├── styles/           # mushroom.css
│       ├── index.ts          # Client entry (components + types)
│       └── core/index.ts     # Headless entry (values, RSC-safe)
├── eslint/                   # Rule configurations and parity tests
├── plans/                    # Implementation planning documents
└── docs/                     # This documentation
```

## Build & Testing

**Monorepo:** pnpm workspaces; catalog pins React 19, TypeScript 5.9.3, Vitest 5

**Package bundler:** tsdown ~0.21.10 (rolldown-based, two ESM entries with sourcemaps)
- Client entry preserves `'use client'` directive
- Core entry RSC-safe (no directives)
- Stylesheet copied to dist/, exported as `./styles.css`
- Peers (react, react-dom, gsap) never bundled

**Quality gates:** publint, arethetypeswrong (ESM-only), size-limit (115 kB gzip)

**Scripts:** `lint` (ESLint 9), `format` (Prettier 3.9), `typecheck`, `test` (Vitest)
- `pnpm check`: lint → format → typecheck → typecheck:consumer → test
- `pnpm lint:package`: publint + arethetypeswrong + size-limit before npm publish
- Pre-commit: husky + lint-staged (format and lint staged files)

## Public Package Exports

- `open-mushroom`: client components and types
- `open-mushroom/core`: constants and types (server-safe)
- `open-mushroom/styles.css`: stylesheet
- `open-mushroom/package.json`: package metadata
