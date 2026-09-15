# System architecture

## Lab App Flow

**Locale Routing (next-intl proxy.ts):**
```
User request → proxy.ts matcher
├─ URL has locale prefix? (en, uk) → set locale
├─ Cookie NEXT_LOCALE? → use it
├─ Accept-Language header? → redirect to matching locale or default
└─ Default locale (en) → serve /

Result: / (en), /uk (uk), /de (404)
```

**Development vs. Production:**

*Development (`NODE_ENV=development`):*
- Turbopack `resolveAlias` maps `open-mushroom/*` imports to `packages/open-mushroom/src/*`
- Package changes visible instantly via HMR (no rebuild needed)
- Server starts ~2s with `pnpm dev`

*Production (`NODE_ENV=production` during `next build`):*
- Turbopack resolveAlias disabled
- `transpilePackages: ['open-mushroom']` ensures Turbopack transpiles the workspace package
- Consumes compiled `packages/open-mushroom/dist/` (built by root `pnpm build:package` as a prerequisite)
- Routes (`/`, `/en`, `/uk`) generated as static (SSG) by `generateStaticParams`

**Metadata & Alternates:**

Every page includes hreflang alternates and Open Graph locale:
- Canonical: `localePath(locale)` (/ for en, /uk for uk)
- hreflang languages: `{ en: '/', uk: '/uk', 'x-default': '/' }`
- OpenGraph locale: `en_US` or `uk_UA` based on route

**Message Parity:**

`i18n/messages-parity.test.ts` ensures both `en.json` and `uk.json` define the same namespaces and keys, with no empty values.

## Manifest Generation Pipeline

**Source:** Figma exports (`assets/source/*.svg` — seven emotions + hat)

**Pipeline:** `tools/skeleton/build-mushroom-skeleton.ts` performs:
1. **Parse:** Load SVG headlessly via paper.js, extract path items by order
2. **Cut:** Apply emotion-specific knife plans (convex shapes in source coordinates) to fuse paths into 24 semantic slots
3. **Pupil extraction:** Compute pupil geometry from hull consensus and least-squares circle fit
4. **Register:** Align `thinking` (different frame size) into shared face space via scale/rotate/translate
5. **Normalize paths:** Rewrite outlines by anatomical start points (stroke ends via ray casting), equalize anchor counts per slot
6. **Validate gates:** Rasterize at 768px, enforce pixel mismatch ≤0.5%, max blob ≤40 px², pupil radius ratios, manifest schema
7. **Write:** Deterministic JSON (stable key order, 1-decimal precision) with source sha256 fingerprint

**CI guard:** `pnpm mushroom:check` (root or package) rebuilds and verifies `git diff --exit-code` on generated files — ensures sources and manifests stay in sync

## Package Structure

**Core** (`src/core/`):
- Animations: GSAP loader (lazy), rig context, runtime, idle loops, morphs, scenarios per emotion
- Constants: emotions, slots, layout, palettes, timings, tuning, idle profiles
- Helpers: geometry, face anchor calculations
- Types: handle, manifest types (hand-written, validated by zod schema in build pipeline)
- Generated: manifests (`*.generated.json`) — emotions, hat; produced by build pipeline, committed to repo
- Schema: zod validation (in `tools/skeleton/`, used at build time and by tests, never imported at runtime)

**React** (`src/react/`):
- Components: `Mushroom`, `MushroomSpeechBubble`; parts: `mushroom-hat`, `mushroom-body`, `mushroom-face`, `mushroom-eye`, `mushroom-slot-path`
- Hook: `useMushroomRig` for animation control
- Utilities: `join-class-names`, `mushroom-ids`, `mushroom-paint-styles`, `speech-bubble-motion`
- Stylesheet: `.om-bubble*` classes, custom properties (`--om-ink`, `--om-white`, `--om-ink-stroke`)

**Public API:**
- `open-mushroom` exports: `Mushroom`, `MushroomSpeechBubble`, types (all 8 types)
- `open-mushroom/core` exports: 12 values + types (emotions, slots, layout, viewBox, timings, idle profiles)
- `MushroomHandle`: stable (`blink`, `lookAt`, `getSnapshot`); diagnostics outside semver

## Rig Invariants

- Viewbox 640×640; hat → body (three radial-gradient ellipses) → face skeleton (24 slots)
- Pupil clipped by `<use>` of eye white; layout transforms + animated groups on separate `<g>`
- State only through props; GSAP loaded after mount; MorphSVGPlugin registered once
- Every animation tracked in per-rig registry, killed on unmount
- Reduced motion = instant frames, no idle life
- Inline ink/white paint (`--om-ink`, `--om-white`, `--om-ink-stroke`)

## Lab Page (Interactive Playground)

**Composition:**
```
MushroomLab
├─ Hero (two columns from lg: copy capped at 32rem, stage takes the rest)
│  ├─ Copy column
│  │  ├─ Hero intro (character name, one-line pitch)
│  │  └─ CTA row (Documentation link, npm install snippet)
│  └─ Preview stage (own @container; min-h-[30rem])
│     ├─ MushroomRig (animation manager)
│     ├─ Speech bubble (optional; beside the body from a 46rem stage, above the head below it)
│     └─ Overlay layer (debug slots/labels/pivots/clips, conditional)
└─ Control panels (row: sm two columns, xl four)
   ├─ Emotion grid (7 emotion thumbnails)
   ├─ Idle life (toggle blink/gaze/breathe/shimmer/talking)
   ├─ Speech bubble (step through demo lines, show or hide in the preview)
   └─ Scene (size, background, second instance, overlay toggles, onion-skin)
```

**State Flow:**
1. `MushroomLab` reducer manages: emotion, size, mounted, holdAt, speech bubble (text, visible), idle toggles, overlay toggles
2. State changes dispatch to reducer actions: `patch`, `bubble`, `idle`, `overlay`
3. `MushroomRig` animates based on state; all animations tracked globally
4. Overlay polls SVG path data every 120 ms (only when overlay enabled) to read slot geometry

**Headless QA Interface:**
- `window.__mushroomLab` registered while playground mounted
- Methods (no semver guarantee): `setEmotion(id)` (validates against core MUSHROOM_EMOTIONS), `setSize(px)`, `setMounted(bool)`, `holdAt(progress | null)` (pauses next transitions at progress share), `pause/play/seek/timeScale` (animation control), `showBubble(text)`, `snapshot()` (emotion, target, transitioning, progress, activeTweens, ready, active), `pageActiveTweens()` (total GSAP tweens on page)
- Used by CI/visual QA scripts; **not part of public API**

**Data Flow (Overlay):**
```
Preview SVG (data-mushroom-root, data-mushroom-slot attributes)
                  ↓
           [120ms poll trigger]
                  ↓
     lab-overlay-layer reads getBBox + computed opacity
                  ↓
      Renders debug labels/pivots/clips with MUSHROOM_SLOT_DEBUG_COLORS
```

## Documentation Pages (MDX Static Rendering)

**Routing & Registry:**
```
User request → [locale]/docs/[[...slug]]/page.tsx
  ├─ hasLocale(locale) → set locale (en, uk)
  ├─ slug? → lookup in docs-registry.has(slug)
  │  └─ not found → notFound() → 404
  ├─ No slug → index (introduction)
  └─ Generate metadata (title, alternates hreflang)
```

**Static Generation:**
- `generateStaticParams()` returns 14 `{ locale, slug? }` tuples (7 slugs × 2 locales)
- `dynamicParams = false`: unknown locales/slugs rejected at build (Map-based registry + hasDoc prevent prototype-key attacks)
- All 20 routes (home + 7×en + 7×uk) prerendered to static HTML at build time

**MDX Compilation & Rendering:**
```
Authored:     content/docs/{locale}/{slug}.mdx
                  ↓
Parsed:       Unified remark/rehype pipeline
                  ├─ remark-gfm: tables, strikethrough
                  └─ rehype-slug: auto id from headings (works with Cyrillic)
                  ↓
Compiled:     source/__next_internal__/app/[locale]/docs/[slug]/page.mdx.js (CommonJS requiring)
                  ↓
Server RSC:   DocArticle component (awaits params, calls async useMDXComponents)
                  ├─ Pre-highlighted code blocks (shiki output → dangerouslySetInnerHTML, trusted)
                  ├─ ComponentPreview (RSC) → readFileSync(examples/<name>.tsx) → shiki highlights source
                  └─ Markdown rendered through mdx-components map
                  ↓
HTML:         Static page with prev/next links, hreflang alternates, edit-on-GitHub
```

**Example Loading (Build-Time Only):**
- `component-preview.tsx` (RSC) reads `fs.readFileSync(join(process.cwd(), 'src/modules/docs/examples/<name>.tsx'))`
- Example source never reaches the client; compiled MDX is a server module
- Client boundary starts at `PreviewTabs` + `CopyButton` (hydrated inside RSC output)
- All six examples use only the public API (`open-mushroom` + `open-mushroom/core`)

**Bubble Anchor as Package Export:**
- `MUSHROOM_BUBBLE_ANCHOR` defined in `core/constants/mushroom-bubble-anchor.ts` (CSS offsets for speech bubble placement)
- Exported from `open-mushroom/core` (semver-minor additive export)
- Computed at build time from body layout constants; used by `lab-preview-stage.tsx` for responsive positioning
