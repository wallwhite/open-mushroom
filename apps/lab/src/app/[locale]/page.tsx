import { useTranslations } from 'next-intl';
import { Mushroom } from 'open-mushroom';

import { PageContainer } from '@/components/layout/page-container';

const HomePage = () => {
  const t = useTranslations('home');

  return (
    <main className="py-6">
      <PageContainer>
        <section className="card-soft flex flex-col items-center gap-6 p-8">
          <Mushroom emotion="neutral" size={240} />
          <p className="text-muted-foreground">{t('placeholder')}</p>
        </section>
      </PageContainer>
    </main>
  );
};

export default HomePage;
