import type { routing } from '@/i18n/routing';
import type messages from '../messages/en.json';

/* Typed locales and message keys for next-intl; the English file is the reference shape. */
declare module 'next-intl' {
  interface AppConfig {
    Locale: (typeof routing.locales)[number];
    Messages: typeof messages;
  }
}
