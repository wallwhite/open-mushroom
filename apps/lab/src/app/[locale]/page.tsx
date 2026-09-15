import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';

import { routing } from '@/i18n/routing';
import { MushroomLab } from '@/modules/lab/components/mushroom-lab';
import { PageContainer } from '@/components/layout/page-container';
import { StructuredData } from '@/components/seo/structured-data';

const HomePage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) notFound();

  return (
    <main className="py-6">
      <PageContainer>
        <MushroomLab />
      </PageContainer>
      <StructuredData locale={locale} />
    </main>
  );
};

export default HomePage;
