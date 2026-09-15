import { defineRouting } from 'next-intl/routing';

/* English lives at the bare path, Ukrainian under /uk; the proxy redirects by Accept-Language on first visit. */
export const routing = defineRouting({
  locales: ['en', 'uk'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

export type AppLocale = (typeof routing.locales)[number];
