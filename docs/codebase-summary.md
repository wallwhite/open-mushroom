# Codebase summary

## Monorepo Layout

```
open-mushroom/
├── packages/
│   └── open-mushroom/src/
│       ├── core/             # Rig, animations, constants, helpers, types
│       ├── react/            # React components, hooks, utilities
│       ├── styles/           # mushroom.css
│       ├── index.ts          # Client entry (components + types)
│       └── core/index.ts     # Headless entry (values, RSC-safe)
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

**Quality gates:** publint, arethetypeswrong (ESM-only), size-limit (115 kB gzip)

**Scripts:** `lint` (ESLint 9), `format` (Prettier 3.9), `typecheck`, `test` (Vitest)
- `pnpm check`: lint → format → typecheck → typecheck:consumer → test
- `pnpm lint:package`: publint + arethetypeswrong + size-limit before npm publish
- Pre-commit: husky + lint-staged (format and lint staged files)

## Lab App Module Map

**Next.js 16 App Router with next-intl 4.14 i18n:**

- `proxy.ts`: next-intl middleware with literal matcher for locale detection (URL prefix → cookie → Accept-Language → default)
- `i18n/routing.ts`: `defineRouting(locales: en, uk; defaultLocale: en; localePrefix: as-needed)` → `/` for en, `/uk` for uk
- `i18n/request.ts`: `getRequestConfig` with locale read via `next/root-params` + `hasLocale` check
- `i18n/navigation.ts`: `createNavigation` for `Link`, `useRouter` with locale awareness
- `app/[locale]/layout.tsx`: Root layout with `NextIntlClientProvider`, metadata (hreflang alternates), fonts (Montserrat via `next/font`), site header/footer
- `app/[locale]/page.tsx`: Index page with `<Mushroom />` component (stub, replaced in phase 6)
- `app/{robots.ts,sitemap.ts,not-found.tsx}`: Static routes and 404 handler
- `components/layout/`: `site-header`, `site-footer`, `locale-switcher`, `page-container` (full-width containers with max-width content)
- `components/ui/button.tsx`: cva variants (default, destructive, outline, ghost, cta, xs, icon-*)
- `components/icons/github-mark-icon.tsx`: Octicon `mark-github` (MIT)
- `lib/site-config.ts`: `siteUrl`, repo/npm URLs from env `APP_URL`
- `lib/utils.ts`: `cn()` class merging utility
- `messages/{en,uk}.json`: i18n copy with namespaces (metadata, header, footer, notFound)
- `vitest.config.ts`: Tests for routing and message parity

**Package consumption:** `transpilePackages: ['open-mushroom']`; in dev, Turbopack `resolveAlias` maps imports to `src/` (HMR); in production, `next build` consumes compiled `dist/`.

## Public Package Exports

- `open-mushroom`: client components and types
- `open-mushroom/core`: constants and types (server-safe)
- `open-mushroom/styles.css`: stylesheet
- `open-mushroom/package.json`: package metadata
