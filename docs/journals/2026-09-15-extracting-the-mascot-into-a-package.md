# Extracting the mascot into a package

2026-09-15

The character had lived inside one application: seven Figma exports, a build that cut them into a face
skeleton, a GSAP rig that morphed between them, and a lab page for tuning. This repository is that
character on its own, as a package anyone can install, with a playground and documentation around it.

## What the work actually was

Eight milestones, each ending in a commit that passes the same gate (`pnpm check`: lint with the
upstream rule set, formatting, type checking including a consumer smoke test, and the test suites).

- **The toolchain first.** The linter had to be the same one, not a similar one: 430 effective rules,
  generated into `eslint/rules-*.ts` from the original's printed configuration, with a parity test that
  compares the effective config against a sanitized reference. Nine rule ids no longer exist in the
  current major versions, so a rename map records where each went and why.
- **The skeleton.** The manifests came over as bytes, guarded by their hashes, before the pipeline that
  produces them did. That split kept the rig's port off the critical path of a 2 800-line build tool.
- **The rig.** Split in two: `src/core` is framework-free and safe to import from a server component,
  `src/react` holds the components. A fixture of 28 server-rendered frames, digested, proves the markup
  did not shift in the move.
- **The package contract.** Two entries, a stylesheet only the speech bubble needs, declarations, a size
  budget (about 101 kB gzipped of a 115 kB limit), and gates that check the export map, the types and the
  tarball's contents before anything is published.
- **The lab and the documentation.** A Next application that consumes the package the way a stranger
  would: from its sources while developing, from its compiled output in a build. Seven documentation
  pages in two languages, each example a real component whose source is read from disk at build time, so
  the code shown and the code running cannot drift.

## What cost the most time

**The environment, not the code.** The pipeline threw `Canvas is unable to provide a 2D context` after
the port. The port was correct: paper.js resolves jsdom with a bare require, and in this workspace it
found the jsdom the React tests use, whose `window` cannot be deleted, so its headless fallback failed.
Running the original pipeline in its own repository proved the difference was the graph, not the code. A
package extension hands paper the jsdom its wrapper pins, and the manifests reproduce byte for byte.

**Framework details that only show up at run time.** The proxy's matcher has to be a literal — an
imported constant returns a 500 in development. Alias targets for the development build must be
relative. A locale layout does not make unknown paths render the localized not-found page; a catch-all
under the locale does. None of these are findable by reading types.

**A fixed size inside a scaling one.** The speech bubble hangs beside the character by offsets derived
from the body's own ellipse, so it holds at any size — except the tail, which is drawn at a fixed size
and therefore landed on a small character's face. The anchor carries the tail's reach in pixels next to
the proportional part, and the gap now measures 3.6 px at the smallest preset and 32 px at the largest.

## What is deliberately not done

The repository is private and nothing is published. The first release is manual by hand, after which the
workflow publishes through a trusted publisher with no tokens involved. Until then the publish job is
gated behind a repository variable that does not exist.

One accessibility finding stays open rather than being quietly fixed: white text on the brand orange
measures 2.43:1, below what the guidelines ask for. The colour comes from the design, so the choice of
how to resolve it belongs to whoever owns the design, not to the person writing the button.
