# Project overview (PDR)

Open Mushroom is a standalone, open-source monorepo extracting an animated character into a reusable React component.

## Scope

**Includes in v0.1 (shipped):**
- `open-mushroom` npm package: character rig with seven emotions, morphing face, idle life, talking, speech bubble; React 19 and GSAP peer dependencies, zero other runtime dependencies
- `open-mushroom/core` headless entry: framework-free values and types for RSCs
- Complete testing suite (87 tests, 16 files)
- ESLint configuration mirroring upstream project

**Includes in v0.1 (planned before release):**
- Mushroom Lab: Next.js playground for trying emotions, sizes, speech bubble
- Bilingual documentation (English and Ukrainian) with live code examples
- Bundling configuration and npm publish workflow

**Excludes (post-v0.1):**
- State machine and presence layer
- Vanilla (non-React) API
- Per-emotion code splitting

## Licensing

- Code: MIT (see LICENSE)
- Artwork: CC BY 4.0 with attribution "Mushroom character by Yaroslav Romanenko" (see LICENSE-ASSETS)
