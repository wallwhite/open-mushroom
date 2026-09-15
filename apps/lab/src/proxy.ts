import createMiddleware from 'next-intl/middleware';

import { routing } from '@/i18n/routing';

/* Locale detection: URL prefix, then the NEXT_LOCALE cookie, then Accept-Language, then the default. */
export default createMiddleware(routing);

/* Next reads this statically, so the matcher must stay a literal: pages only, never API routes, internals or files. */
export const config = {
  matcher: '/((?!api|_next|_vercel|.*\\..*).*)',
};
