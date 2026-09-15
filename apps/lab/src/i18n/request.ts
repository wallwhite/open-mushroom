import { notFound } from 'next/navigation';
import * as rootParams from 'next/root-params';
import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import { routing } from '@/i18n/routing';

/* Resolves the request locale from the [locale] segment; unknown segments are a 404, not a fallback. */
export default getRequestConfig(async ({ locale }) => {
  let resolved = locale;

  if (resolved === undefined) {
    const fromRoute = await rootParams.locale();

    if (!hasLocale(routing.locales, fromRoute)) notFound();
    resolved = fromRoute;
  }

  const catalogue = await import(`../../messages/${resolved}.json`);

  return { locale: resolved, messages: catalogue.default };
});
