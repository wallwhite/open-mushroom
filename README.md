# Open Mushroom

Mushroom is an animated SVG mascot for React: seven emotions with a morphing face, idle life (blinks, gaze,
breathing), talking, and a speech bubble. Zero runtime dependencies besides React and GSAP.

> Status: pre-release. The first npm release (`0.1.0`) is being prepared; the API below may still move.

## Packages

| Path                     | What                                                  |
| ------------------------ | ----------------------------------------------------- |
| `packages/open-mushroom` | The `open-mushroom` npm package                       |
| `apps/lab`               | Mushroom Lab: playground and documentation (Next.js)  |
| `tools/skeleton`         | Skeleton build pipeline (SVG sources → rig manifests) |

## Quick start

```bash
npm install open-mushroom gsap
```

```tsx
import { Mushroom } from 'open-mushroom';
import 'open-mushroom/styles.css';

export const Hero = () => <Mushroom emotion="excited" size={240} />;
```

Full documentation lives in Mushroom Lab (`apps/lab`, `/docs`).

## Development

```bash
pnpm install
pnpm check   # lint, format, typecheck, test
pnpm build   # package first, then the lab
```

Node 22 and pnpm 10 (see `.nvmrc` and `packageManager`). Releases are versioned with Changesets.

## Licenses

- Code: [MIT](./LICENSE)
- Artwork (source SVG exports and generated skeleton manifests): [CC BY 4.0](./LICENSE-ASSETS), attribution
  "Mushroom character by Yaroslav Romanenko"
- GSAP is a peer dependency under the GSAP Standard License (no charge); MorphSVGPlugin ships in the public
  `gsap` package
