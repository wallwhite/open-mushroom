import { type AppLocale, routing } from '@/i18n/routing';

/* The public path of a page in a locale: bare for the default language, prefixed for the others. */
export const localePath = (locale: AppLocale, path = '/'): string => {
  if (locale === routing.defaultLocale) return path;

  return path === '/' ? `/${locale}` : `/${locale}${path}`;
};
