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
- `components/mushroom-lab.tsx`: Main playground (hero: name, pitch and calls to action beside the preview from lg; four control panels in a row below, two columns from sm and four from xl)
- `components/lab-hero-intro.tsx`: Page heading (the character's name) and the one-line pitch, both from `lab.hero` messages
- `components/lab-preview-stage.tsx`: Character preview with optional speech bubble, own container query for the bubble's placement
- `components/lab-preview-cta.tsx`: Documentation link and npm install snippet (with copy button), under the pitch in the hero's copy column
- `components/lab-install-snippet.tsx`: Copy-to-clipboard with Clipboard API fallback to text selection
- `components/lab-emotion-grid.tsx`: Seven emotion thumbnails (56 px) with aria-pressed states
- `components/lab-idle-panel.tsx`: Toggles for idle life aspects (blink, gaze, breathe, shimmer, talking) + manual blink/look-centre buttons
- `components/lab-bubble-panel.tsx`: Single demo line set selector, current line rendered by the real component (the card itself is a button), arrows that wrap around, show/hide in the preview
- `components/lab-stage-controls.tsx`: Size (40–400 px), background (page/card/fab/dark), second instance toggle (56 px header), overlay toggles (slots/labels/pivots/clips), onion-skin (emotion + opacity)
- `components/lab-overlay-layer.tsx`: Debug overlay reading SVG path data every 120 ms, renders slot labels/pivots/clips with `MUSHROOM_SLOT_DEBUG_COLORS` from core
- `components/lab-panel.tsx`: Reusable panel wrapper (uppercase title, card chrome)

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

## Docs Module

**Location:** `apps/lab/src/modules/docs/` (7 MDX pages en+uk, 6 live examples, sidebar, pager)

**Registry & Routing:**
- `docs-registry.ts`: `Map<slug, { en: () => import(…), uk: () => import(…) }>` (not plain object; `/docs/constructor` → 404)
- `docs-nav.ts`: sidebar navigation (three groups: getting started, guides, reference) + pager order
- `[locale]/docs/[[...slug]]/page.tsx`: dynamic route with `dynamicParams = false` (static 20 routes total)
- `docs/layout.tsx`: two-column layout (16rem sticky sidebar on lg, mobile `<details>` disclosure)

**Content & Examples:**
- `content/docs/{en,uk}/*.mdx`: seven pages (introduction, emotions, idle-life-and-talking, imperative-handle, speech-bubble, theming-sizing-and-ssr, api-reference)
- `examples/{basic,emotion-switcher,idle-and-talking,look-at-pointer,speech-bubble,theming}.tsx`: client components (≤60 lines, public API only)

**MDX & Rendering:**
- `@next/mdx` with plugins `remark-gfm`, `rehype-slug`
- Syntax highlighting: `shiki` (async, server-side, build-time; theme github-light) through the async `<CodeBlock>` and `<ComponentPreview>` server components in the MDX component map
- `mdx-components.tsx`: component map (h2/h3 anchored, a → locale-aware Link, pre → CodeBlock, table → scrollable wrapper, `Callout`, `ComponentPreview`)
- `component-preview.tsx` (RSC): reads example source from `node:fs` at build time, tabs Preview (live render) and Code (highlighted, copy button)

**Components & Copy:**
- `copy-button.tsx`: shared UI (lab install snippet + code blocks); icon swap on copy, 2s timer
- `docs-sidebar.tsx`: sticky sidebar with groups/pages, aria-current page marking, nested `<details>` on mobile
- `docs-pager.tsx`: previous/next navigation, edit-on-GitHub link
- `docs-link.tsx`, `docs-heading.tsx`, `docs-table.tsx`: layout components
- `preview-tabs.tsx`: tabs (Preview/Code) with keyboard navigation
- `highlighted-code.tsx`: shiki output wrapper with language label

**Localization:**
- `messages.docs`: namespace (nav, pager, preview tabs, copy, editOnGitHub)
- per-page metadata (title, description)
- both languages mirror structure and example names

## Public Package Exports

- `open-mushroom`: client components and types
- `open-mushroom/core`: constants (12 values, incl. `MUSHROOM_BUBBLE_ANCHOR`), types
- `open-mushroom/styles.css`: stylesheet
- `open-mushroom/package.json`: package metadata
