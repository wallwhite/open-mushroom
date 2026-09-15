# Codebase summary

## Structure

```
open-mushroom/
├── packages/
│   └── open-mushroom/       # npm package (core rig + React components)
├── apps/
│   └── lab/                 # Next.js playground + bilingual docs
├── tools/
│   └── skeleton/            # SVG-to-manifest build pipeline
├── eslint/                  # Rule maps, overrides, parity tests
│   ├── rules-*.ts           # Per-plugin rule configurations
│   ├── rules-overrides.ts   # Test/tooling/declaration overrides
│   ├── rule-renames.ts      # Deprecated rule replacements
│   └── fixtures/            # Smoke test fixtures
└── docs/                    # This documentation
```

## Workspace & Tooling

- **Monorepo:** pnpm workspaces with catalog for react, typescript, vitest pinning
- **Build:** `build:package` compiles package first; lint, typecheck, test depend on it
- **Testing:** Vitest 5 with ESLint config tests in the `tooling` project
- **Pre-commit:** husky + lint-staged 16 format and lint staged files

## Entry Points

- Package: `open-mushroom` (components) and `open-mushroom/core` (headless rig)
- Lab: served from `apps/lab`; consumes package from `packages/open-mushroom/dist`
