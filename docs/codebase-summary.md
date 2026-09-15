# Codebase summary

## Monorepo Layout

```
open-mushroom/
├── packages/
│   └── open-mushroom/
│       ├── assets/
│       │   ├── source/        # Figma exports (seven emotions + hat SVG)
│       │   └── README.md      # Pipeline documentation and commands
│       ├── tools/skeleton/    # Build pipeline: CLI, modules, tests, schema
│       ├── src/
│       │   ├── core/          # Rig, animations, constants, helpers, types, generated manifests
│       │   ├── react/         # React components, hooks, utilities
│       │   └── styles/        # mushroom.css
│       ├── index.ts           # Client entry (components + types)
│       └── core/index.ts      # Headless entry (values, RSC-safe)
├── apps/
│   └── open-mushroom-lab/src/  # Next.js 16 lab playground (private)
│       ├── app/[locale]/      # Dynamic locale-routed pages
│       ├── components/        # Layout, UI, icons
│       ├── i18n/              # Routing, request config, navigation
│       ├── lib/               # Utilities, site config
│       ├── proxy.ts           # next-intl middleware
│       └── globals.css        # Tailwind v4 with design tokens
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

**Face skeleton build pipeline:** `tools/skeleton/build-mushroom-skeleton.ts` (CLI) + 19 supporting modules
- Inputs: Figma exports (`assets/source/*.svg` — seven emotions + hat)
- Outputs: deterministic JSON manifests (`src/core/generated/*.{emotions,hat}.generated.json`)
- Gates: pixel mismatch ≤0.5%, max connected blob ≤40 px², pupil geometry, manifest sha256
- Development dependencies: paper 0.12.18, paper-jsdom 0.12.18 (headless SVG context), sharp 0.35.4 (raster validation), tsx
- CI guard: `pnpm mushroom:check` = build + `git diff --exit-code` on generated files

**Quality gates:** publint, arethetypeswrong (ESM-only), size-limit (115 kB gzip)

**Scripts:** `lint` (ESLint 9), `format` (Prettier 3.9), `typecheck`, `test` (Vitest)
- `pnpm check`: lint → format → typecheck → typecheck:consumer → test
- `pnpm mushroom:build [--debug] [--report <file.md>]`: rebuild manifests from SVG sources
- `pnpm mushroom:check`: verify build output matches committed manifests (CI gate)
- `pnpm lint:package`: publint + arethetypeswrong + size-limit before npm publish
- Pre-commit: husky + lint-staged (format and lint staged files)

## Lab App Module Map

**Next.js 16 App Router with next-intl 4.14 i18n:**

- `proxy.ts`: next-intl middleware with literal matcher for locale detection (URL prefix → cookie → Accept-Language → default)
- `i18n/routing.ts`: `defineRouting(locales: en, uk; defaultLocale: en; localePrefix: as-needed)` → `/` for en, `/uk` for uk
- `i18n/request.ts`: `getRequestConfig` with locale read via `next/root-params` + `hasLocale` check
- `i18n/navigation.ts`: `createNavigation` for `Link`, `useRouter` with locale awareness
- `app/[locale]/layout.tsx`: Root layout with `NextIntlClientProvider`, metadata (hreflang alternates), fonts (Montserrat via `next/font`), site header/footer
- `app/[locale]/page.tsx`: Index page with `<MushroomLab />` component (interactive playground)
- `app/{robots.ts,sitemap.ts,not-found.tsx}`: Static routes and 404 handler
- `components/layout/`: `site-header`, `site-footer`, `locale-switcher`, `page-container` (full-width containers with max-width content)
- `components/ui/button.tsx`: cva variants (default, destructive, outline, ghost, cta, xs, icon-*)
- `components/icons/github-mark-icon.tsx`: Octicon `mark-github` (MIT)
- `lib/site-config.ts`: `siteUrl`, repo/npm URLs from env `APP_URL`
- `lib/utils.ts`: `cn()` class merging utility
- `messages/{en,uk}.json`: i18n copy with namespaces (metadata, header, footer, notFound, **lab**)
- `modules/lab/`: Interactive character playground (see Lab Module section below)
- `vitest.config.ts`: Tests for routing and message parity

**Package consumption:** `transpilePackages: ['open-mushroom']`; in dev, Turbopack `resolveAlias` maps imports to `src/` (HMR); in production, `next build` consumes compiled `dist/`.

## Lab Module (Interactive Playground)

**Location:** `apps/lab/src/modules/lab/`

**Component tree:**
- `components/mushroom-lab.tsx`: Main playground (preview + four-panel aside on lg, stacked below on mobile)
- `components/lab-preview-stage.tsx`: Character preview with optional speech bubble and CTA row
- `components/lab-preview-cta.tsx`: Documentation link and npm install snippet (with copy button)
- `components/lab-install-snippet.tsx`: Copy-to-clipboard with Clipboard API fallback to text selection
- `components/lab-emotion-grid.tsx`: Seven emotion thumbnails (50×50 px) with aria-pressed states
- `components/lab-idle-panel.tsx`: Toggles for idle life aspects (blink, gaze, breathe, shimmer, talking) + manual blink/look-centre buttons
- `components/lab-bubble-panel.tsx`: Single demo line set selector, current line display (button wrapper, aria-label), next/hide controls
- `components/lab-stage-controls.tsx`: Size (40–400 px), background (page/card/fab/dark), second instance toggle (56 px header), overlay toggles (slots/labels/pivots/clips), onion-skin (emotion + opacity)
- `components/lab-overlay-layer.tsx`: Debug overlay reading SVG path data every 120 ms, renders slot labels/pivots/clips with `MUSHROOM_SLOT_DEBUG_COLORS` from core
- `components/lab-panel.tsx`: Reusable panel wrapper (title, collapsible on mobile)

**State management:**
- `state/lab-state.ts`: Reducer with actions (patch, bubble, idle, overlay) managing emotion, size, mounted, holdAt, speechBubble visibility/text, idle toggles, scene settings
- Actions: `patch` (emotion/size/mounted/holdAt), `bubble` (text, visible), `idle` (idleParts map), `overlay` (slot/label/pivot/clip toggles)

**Hooks:**
- `use-lab-debug-handle.ts`: Registers `window.__mushroomLab` (headless QA surface) with methods: setEmotion, setSize, setMounted, holdAt, pause/play/seek/timeScale, showBubble, snapshot(), pageActiveTweens()
- `use-lab-hold.ts`: rAF-watcher pausing each emotion transition at `holdAt` progress share
- `use-page-active-tweens.ts`: Counts live GSAP animations via `globalTimeline` (returns total active tweens across page)

**Constants:**
- `constants/lab-presets.ts`: Size array (40, 56, 64, 96, 160, 240, 400), background names, second instance role text, overlay polling interval (120 ms)

**Tests:**
- `state/lab-state.test.ts`: Reducer actions and state invariants
- `lab-bubble-lines.test.ts`: Demo lines parity (six lines per locale, ≤70 chars, no exclamation marks)

**Localization:**
- `messages.lab`: namespace with title, emotion grid, idle panel, speech bubble (including six demo lines), scene controls, CTA copy
- No Cyrillic in module sources (tests only; copy via messages)

## Public Package Exports

- `open-mushroom`: client components and types
- `open-mushroom/core`: constants and types (server-safe)
- `open-mushroom/styles.css`: stylesheet
- `open-mushroom/package.json`: package metadata
