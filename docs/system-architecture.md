# System architecture

## Package Layers

**Core** (`open-mushroom/core`):
- Constants (viewBox 640×640, 24 face slots, seven emotions)
- Layout math and geometry calculations
- GSAP loader and animation runtime
- React-free; can be used for non-React projects (future)

**React** (`open-mushroom`):
- React components wrapping the core
- Custom hooks for emotion, idle life, talking
- Speech bubble component
- Types and type exports

## Rig Invariants

- 24 face slots per emotion (blinking, gaze, breathing states)
- Morph duration: 450 ms
- Idle life: per-emotion profile (blink rate, gaze pattern, breathing)
- No runtime dependencies besides React and GSAP

## Lab & Documentation

- Next.js App Router with server and client components
- Bilingual via next-intl (auto-detect, default English)
- Package consumed from source (`packages/open-mushroom/src`) during dev
- Package consumed from dist build in production
- MDX pages with live code examples (source shown in block, rendered above)
