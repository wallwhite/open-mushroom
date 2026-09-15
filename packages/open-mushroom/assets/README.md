# Mushroom assets — face skeleton pipeline

`source/` holds the Figma exports of Mushroom Gennadiyovych (Машрум Геннадійович): seven facial expressions
(`neutral, staring, thinking, sleep, excited, angry, drunk`) and the hat. They are
the single source of truth; the runtime never reads them. `pnpm mushroom:build`
turns them into `src/core/generated/*.generated.json`, which the rig consumes as-is; the manifest
invariants test validates them with the same zod schema (`tools/skeleton/mushroom-manifest.schema.ts`).

Run the commands from `packages/open-mushroom` (or `pnpm --filter open-mushroom <script>` from the
repository root); a `--report` path is relative to that directory.

## Commands

| Command                                  | What it does                                                                                    |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `pnpm mushroom:build`                    | rebuild both manifests; exits 1 when a gate fails (nothing is written then)                     |
| `pnpm mushroom:build --debug`            | also writes `original/assembly/diff/slots` PNGs per emotion to `.mushroom-debug/`               |
| `pnpm mushroom:build --report <file.md>` | writes the gate table as markdown                                                               |
| `pnpm mushroom:check`                    | build + `git diff --exit-code` on the generated files (CI guard: sources and manifests in sync) |
| `pnpm test`                              | runs the five pipeline tests in `tools/skeleton/*.test.ts` and the manifest invariants test     |

Runs offline on Node 22 with `paper-jsdom` (paper.js + jsdom 16, dev-only) and `sharp`.
Never add `paper-jsdom-canvas` or `canvas`: they pull native builds that pnpm 10 blocks.

## What the export looks like

- Every face line is a **filled outline** (Figma "outline stroke", ≈14 units wide in a
  1536×1024 frame), no groups, no ids, commands `M C L Z` only.
- Parts are **fused into single paths**: in six emotions the left brow, left eye ring,
  pupil, nose and the short cheek stroke are one path; `angry` also fuses the right brow
  with its ring; `sleep` fuses the drool with the mouth; `thinking` fuses a dimple with
  the mouth but keeps the rest apart and lives in a different frame (1295×1214).
- Every white is followed by a grey `stroke="#808080"` duplicate (export artefact) — dropped.
- **Whites are cut around the pupils** and the pupil ink belongs to the ring path. The
  white's concave notch is an arc of the pupil circle; the white also bites a highlight
  out of the disc (a comma or a thin crescent), so the pupil is _not_ a plain circle.

## Pipeline (`tools/skeleton/build-mushroom-skeleton.ts`)

1. `paper-context.loadSourceSvg` imports the SVG headlessly (paper prepends the viewport
   as child #0; only real path items are mapped to `<path>` order).
2. `cut-plan.ts` names, per emotion, which path feeds which slot and where the knives go.
   Knives are convex shapes (`rect`, rotated `strip`, `half-plane`) **in source
   coordinates, applied before registration**, so retuning the registration never moves a cut.
   The piece inside a knife is cut with the knife grown by 1.5 units, the rest with the
   exact knife: pieces overlap and no anti-aliasing seam shows at the joint.
3. `pupil-extract.ts`: hull(white) − white = the notch → its arc points → consensus +
   least-squares circle fit → `pupil-*` slot = ring ∩ disc ∩ hull (the original ink,
   highlight included), ring loses it, white gains `disc ∩ hull` so it can clip the moving pupil.
4. `render-check.ts` rasterises the original (without grey duplicates) and the reassembly
   at 768px and enforces the gates below; `--debug` PNGs are the iteration tool.
5. `assemble-frame.toEmotionFrame` registers `thinking` into the shared face space
   (`registration` in the cut plan: scale/rotate/translate matching the eye line of the
   other six) and computes anchors (eye centres, mouth centre, wrist).
6. `write-generated.ts` validates with zod and writes deterministic JSON (stable key
   order, 1-decimal coordinates). `sourceSha256` records the inputs.

### Gates

| Gate                                            | Threshold                                                    |
| ----------------------------------------------- | ------------------------------------------------------------ |
| pixel mismatch (diff px / content px)           | ≤ 0.5%                                                       |
| largest connected diff blob                     | ≤ 40 px²                                                     |
| assembly without pupil slots vs original        | differs by pupil ink area ±20% (proves the pupil was lifted) |
| pupil radius / white height (open-eye emotions) | ≥ 0.3; sleep/drunk must have no pupils                       |

Current build: mismatch ≤ 0.01% and blobs ≤ 2 px² on all seven, before and after resampling; the manifest is ~376 KB (92 KB gzipped) because every slot carries the same, evenly spaced anchors in every emotion.

## Slots (`MUSHROOM_SLOT_IDS`)

`brow-left, brow-right, eye-left-ring, lid-fold-left, eye-left-white, pupil-left,
eye-right-ring, lid-fold-right, eye-right-white, pupil-right, nose, nose-side,
wrinkle-left, wrinkle-right, dimple-right, under-eye-left, under-eye-right, mouth, chin,
mouth-corner-left, mouth-corner-right, hand, drool-ink, drool-white` (24). Missing part =
`null` (the rig cross-fades it).

The skeleton is cut so that every slot has the **same stroke structure in every emotion
where it exists**: MorphSVG can only interpolate cleanly between two ribbons with the same
number of ends. Semantics worth knowing:

- `brow-left` owns the whole descending arc down to the point where the stroke becomes the
  nose bridge.
- `nose` is the one main stroke: bridge → tip → the rising wing or hook on the right. The far side
  of the nose (`staring`: the loop that branches off the bridge; `thinking`: the long right contour)
  is `nose-side` and fades in and out elsewhere.
- `lid-fold-left/right` are the arches above `thinking`'s upper lids (only there).
- `wrinkle-left/right` are the nasolabial lines from the nostrils toward the mouth corners
  (`angry` draws them long, down around the mouth); `under-eye-right` is the bag under the
  right eye, fused into the nose stroke in most exports.
- `brow-left` also owns the stroke that runs on from its arc, down past the eye, as far as the point
  where the nose's own form starts (where its wing opens out). Six emotions draw the brow and that
  descent as one stroke and `thinking` keeps them apart, so the piece belongs to the brow, which
  retracts it while morphing. It is never part of the nose, and the nose keeps its own shape. The
  knife runs after the eye ring's, so the lid keeps its inner tip.
- `mouth` is the lip line only; the vertical ticks at its ends (`neutral`, `staring`) and the
  small corner strokes (`sleep`, `angry`) are `mouth-corner-left/right`.
- `dimple-right` is the crease at the right mouth corner (`staring`, `thinking`);
  `chin` is absent in `thinking`; `hand` only in `thinking`; `drool-*` only in `sleep`.

Knife rules: several knives may feed one slot (their pieces are united, so an L-shaped
brow is two or three boxes); a `strip` is a box along a segment, a `half-plane` is a true
half-plane; knives are placed from scanline measurements of the source raster
(1 unit = 1 px at 1536 wide). Once a slot is complete, hairline crumbs left at a seam
(thinner than 6 units or under 60 units²) are dropped; anything bigger that goes missing
shows up as a red blob in `*-diff.png`.

## Outline normalisation (`normalize-path-start.ts`)

MorphSVG pairs the first anchor of one outline with the first anchor of the other and walks
both in their authored direction, matching anchors by index. Figma starts each outline
wherever the pen was and packs anchors densely on bends, so the same nose in two emotions
would start at opposite ends and its two sides would drift onto each other halfway (the
black-nose artefact). After registration every subpath is rewritten in place:

- outer contours clockwise, holes the other way (nonzero fill);
- start at the slot's anatomical point (`START_RULES`): the upper end of vertical strokes
  (nose, wrinkles, ticks), the left end of horizontal ones (brows, lip, bags, chin), the
  top-left extreme of loops and blobs (rings, whites, pupils). Stroke ends are found by
  casting a ray inward from each outline point: where the shape is deeper than 2.5 widths
  the point sits on an end;
- **one anchor count per slot, shared by every emotion** (`anchor-budget.ts`: the longest outline
  the slot has anywhere, one anchor per 7 units). MorphSVG pairs anchors by index and, when the
  counts differ, inserts points into the longer segments of the shorter shape — which shifts every
  later index and twists the ribbon halfway through. With equal counts and even spacing, index k is
  the same fraction of the outline in every emotion;
- the outline rebuilt from those samples, keeping the tangent on each side of a sample and pulling
  a sample onto every corner, so cap ends and knife cut faces stay crisp. Each rebuilt span is
  compared with the arc it replaced, in both directions, and the build stops when one strays more
  than 2.5 units (a third of a pixel at the sizes the mushroom is drawn);
- subpaths ordered largest first.

A stroke has two ends and the rule alone cannot always tell them apart: a nose whose wing rises
as high as its bridge, a brow whose arc and tail both end low. Reading one emotion from the far
end maps the left side of the ribbon onto the right and the shape twists as it morphs. So the
build runs **twice**: the draft pass reads every slot by its rule and expresses each start as a
fraction of that slot's own box, the emotions vote on the corner, and the second pass reads every
emotion from there (`start-anchors.ts`). Where even that cannot see the anatomical end, the cut
plan pins the start: `starts: { nose: [x, y] }` in source coordinates, nearest outline point wins.

Four checks guard the pass, because none of them sees what the others do:

1. `normalizePathStart` compares every rebuilt span with the arc it replaced (above), naming the
   emotion, slot and subpath when it stops the build.
2. The pixel gates run **twice**: once on the pieces as the knives left them, and again on the
   shipped outlines for the six emotions that stay in source coordinates. The second pass is what
   covers registration and resampling.
3. `emotion-frame.ts` refuses a path whose rounded walk misses its own start by more than half a
   unit. The data is written as relative curves, so rounding error accumulates; past half a unit
   MorphSVG's parser adds a closing anchor and that emotion silently gets one anchor more than the
   others. The serialiser measures each delta from the position already written, which keeps the
   error inside one rounding step — the walks close exactly today.
4. `manifest-outlines.test.ts` checks the shipped manifest: equal anchor counts per slot, every
   subpath closing on its start, no bulging zero-chord curve at a seam, no slot whose two readings
   leave in opposite directions (the signature of a reversed start), and normalisation as a fixed
   point — re-reading an outline lands on the start it already has. A slot only one emotion has is
   cross-faded, never morphed, so it is exempt from the last check.

The runtime pins `shapeIndex` to 0 for every subpath (`morph-shape-index.ts`), so the
identity mapping is used and no "closer" start is searched.

## Source path map (0-based `<path>` order)

| Emotion  | Dropped | Fused path → knives                                                                                                                                                                                                                                                                                        | Direct slots                                                                                                                      |
| -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| neutral  | 0, 1    | #2: brow-left (boxes y ≤ 330, x ≥ 600 down to 340, x ≥ 626 down to 362), eye-left-ring (x ≤ 627, y 330–482), wrinkle-left (box), wrinkle-right (strip), under-eye-right (strip), rest nose; #8: mouth-corner-left/right (strips along the ticks), rest mouth                                               | 3 brow-right, 4 eye-right-ring, 5 eye-right-white, 6 eye-left-white, 7 under-eye-left, 9 chin                                     |
| staring  | 0, 1    | #3: brow-left (y ≤ 284, x ≥ 624 down to 306), eye-left-ring (x ≤ 620, y 284–442), wrinkle-left (box), wrinkle-right (strip), nose-side (boxes x ≥ 690 above the junction, x ≥ 740 down to the cap), rest nose; #10: mouth-corner-left (two strips, the tick bends), mouth-corner-right (strip), rest mouth | 2 brow-right, 4 eye-right-ring, 5 eye-left-white, 6 eye-right-white, 7 under-eye-right, 8 under-eye-left, 9 dimple-right, 11 chin |
| thinking | 0–3     | #10: wrinkle-left (box), wrinkle-right (box), nose-side (two strips down the bowed right contour), rest nose; #15: dimple-right (strip), rest mouth; #7: lid-fold-left (boxes above the lid), rest eye-left-ring; #5: lid-fold-right (boxes), rest eye-right-ring                                          | 4 brow-right, 6 brow-left, 8+9 eye-right-white, 11+12 eye-left-white, 13 under-eye-right, 14 under-eye-left, 16 hand              |
| sleep    | 0       | #1: brow-left (y ≤ 300, x 600–720 down to 334), eye-left-ring = lower arc of the closed-lid loop (x ≤ 650, y 334–400), wrinkle-left (box), wrinkle-right (strip), under-eye-right (strip), rest nose; #5: drool-ink (box below the lip), rest mouth                                                        | 2 brow-right, 3 eye-right-ring, 4 under-eye-left, 6 drool-white, 7 mouth-corner-right, 8 mouth-corner-left, 9 chin                |
| excited  | 0, 1    | #2: brow-left (y ≤ 302, x ≥ 650 down to 338), eye-left-ring (x ≤ 641, y 302–472), wrinkle-left (box), wrinkle-right (strip), under-eye-right (strip), rest nose                                                                                                                                            | 3 brow-right, 4 eye-right-ring, 5 eye-left-white, 6 eye-right-white, 7 under-eye-left, 8 mouth, 9 chin                            |
| angry    | 0, 1    | #2: brow-left (three boxes around the arc), eye-left-ring (four boxes hugging the bridge's left edge), wrinkle-left (box), wrinkle-right (two strips along the bowed line), under-eye-right (strip), rest nose; #3: brow-right (half-plane above the brow line), rest eye-right-ring                       | 4 eye-left-white, 5 eye-right-white, 6 under-eye-left, 7 mouth, 8 chin, 9 mouth-corner-right, 10 mouth-corner-left                |
| drunk    | 0–2     | #3: brow-left (y ≤ 350, x ≥ 652 down to 396), eye-left-ring (x ≤ 652, y 366–490, holes filled), wrinkle-left (box), wrinkle-right (strip), under-eye-right (strip), rest nose                                                                                                                              | 4 brow-right, 5 eye-right-ring, 6+8 eye-left-white, 7 eye-right-white, 9 under-eye-left, 10 mouth, 11 chin                        |

Pupils are fitted automatically for the five open-eye emotions (`pupils: 'auto'`); a
`{cx, cy, r}` override in the cut plan wins when a notch cannot be read.

## Reading a failed build

- `mismatch` high with a small blob: a cut ate part of a neighbour — look at `*-slots.png`.
- one large blob: a knife missed a joint, or a pupil fit is off — `*-diff.png` shows it in red.
- "pupil disc is not covered by ring ink": the notch fit landed outside the pupil —
  check the white's outline near the pupil, or add a `pupils` override.
- pupil diff ≠ pupil ink ±20%: the pupil slot does not carry the pupil (fit or order bug).

Regenerate after any change in `source/` or `cut-plan.ts`, commit the JSON with it.
