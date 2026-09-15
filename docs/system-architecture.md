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
├─ Preview stage (flex-1)
│  ├─ MushroomRig (animation manager)
│  ├─ Speech bubble (optional, positioned above character)
│  ├─ Overlay layer (debug slots/labels/pivots/clips, conditional)
│  └─ CTA row (Documentation link, npm install snippet)
└─ Control panels (aside, lg:w-[26rem]; stacked below on mobile)
   ├─ Emotion grid (7 emotion thumbnails)
   ├─ Idle life (toggle blink/gaze/breathe/shimmer/talking)
   ├─ Speech bubble (select demo line, show in preview)
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
