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

- **Monorepo:** pnpm workspaces; catalog pins React 19, TypeScript 5.9.3, Vitest 5
- **Package build:** `build:package` emits ESM + types to `dist/`
- **Scripts:** `lint` (ESLint 9), `format` (Prettier 3.9), `typecheck`, `test` (Vitest, 87 tests in 16 files)
- **Pre-commit:** husky + lint-staged lint and format staged files
- **CLI:** `pnpm check` runs all validation (lint, format, typecheck, test)

## Public Entries

- `open-mushroom`: components and types (client-side)
- `open-mushroom/core`: values and types (RSC-safe, framework-free)
