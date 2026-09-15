import { getTranslations } from 'next-intl/server';

import type { AppLocale } from '@/i18n/routing';
import { siteConfig } from '@/lib/site-config';

/* What the page is, in the vocabulary search engines read: a source package, its repository and its licence. */
export const StructuredData = async ({ locale }: { locale: AppLocale }) => {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: siteConfig.name,
    description: t('description'),
    url: siteConfig.siteUrl,
    codeRepository: siteConfig.repoUrl,
    programmingLanguage: 'TypeScript',
    runtimePlatform: 'React',
    license: 'https://opensource.org/licenses/MIT',
    author: { '@type': 'Person', name: siteConfig.author, url: siteConfig.authorUrl },
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
};
