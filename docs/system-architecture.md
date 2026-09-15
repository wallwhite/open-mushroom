# System architecture

## Package Structure

**Core** (`src/core/`):
- Animations: GSAP loader (lazy), rig context, runtime, idle loops, morphs, scenarios per emotion
- Constants: emotions, slots, layout, manifest loader, palettes, timings, tuning, idle profiles
- Helpers: geometry, face anchor calculations
- Types: handle, manifest types (hand-written + schema)
- Generated: manifests from SVG skeleton (emotions, hat)

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
