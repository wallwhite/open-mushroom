# Open Mushroom: agent guide

pnpm monorepo. `packages/open-mushroom` is the npm package (React + GSAP mascot rig), `apps/lab` is the
Next.js lab and documentation site, `tools/` holds the skeleton build pipeline (dev-only).

## Commands

- `pnpm install`, then `pnpm check` (lint → format → typecheck → test) before every commit
- `pnpm build` builds the package first, then the lab; `pnpm dev` runs the lab against package sources
- Lint, typecheck and tests build the package first because the lab resolves `open-mushroom` types from `dist`

## Conventions

- kebab-case file names, files under 200 lines (documented exceptions: the two skeleton pipeline modules named in
  `CONTRIBUTING.md`), layer-first module layout
- Comments explain why; never reference plans, phases or review findings in code or file names
- The ESLint flat config (`eslint.config.ts` + `eslint/rules-*.ts`) mirrors the upstream rule set 1:1; the
  reference lives in `eslint/reference/upstream-effective-rules.txt`. Do not relax rules to make lint pass
- Prettier options: `.prettierrc.json`; husky + lint-staged run on commit
- Conventional commits without AI references; never commit secrets, tokens or local machine paths

## Next.js

This is not the Next.js you know. Before writing any Next.js code in `apps/lab`, read the relevant guide in
`apps/lab/node_modules/next/dist/docs` (breaking changes vs training data). `next dev` maintains its own
`apps/lab/AGENTS.md` block; keep it committed.

## Internal docs

`docs/` holds the project overview, code standards, architecture, deployment and roadmap. Keep them in sync
with the code.
