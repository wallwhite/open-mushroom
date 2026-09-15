import type { ReactNode } from 'react';

import { Analytics } from '@vercel/analytics/next';
import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import 'open-mushroom/styles.css';
import '@/app/globals.css';

import { localePath } from '@/i18n/locale-path';
import { routing, type AppLocale } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';

interface LocaleLayoutProps {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}

const montserrat = Montserrat({ subsets: ['latin', 'cyrillic'], variable: '--font-app-sans', display: 'swap' });

export const generateStaticParams = (): Array<{ locale: AppLocale }> => routing.locales.map((locale) => ({ locale }));

export const generateMetadata = async ({ params }: LocaleLayoutProps): Promise<Metadata> => {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: 'metadata' });

  return {
    metadataBase: new URL(siteConfig.siteUrl),
    title: { default: t('title'), template: `%s · ${t('title')}` },
    description: t('description'),
    alternates: {
      canonical: localePath(locale),
      languages: { en: '/', uk: '/uk', 'x-default': '/' },
    },
    openGraph: {
      type: 'website',
      siteName: t('title'),
      title: t('title'),
      description: t('description'),
      url: localePath(locale),
      locale: locale === 'uk' ? 'uk_UA' : 'en_US',
    },
  };
};

/* Every route lives under the locale segment; an unknown segment is a 404, never a silent fallback. */
const LocaleLayout = async ({ children, params }: LocaleLayoutProps) => {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <html lang={locale} className={montserrat.variable}>
      <body className="flex min-h-screen-dvh flex-col">
        <NextIntlClientProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
};

export default LocaleLayout;
