import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';

const NotFoundPage = () => {
  const t = useTranslations('notFound');

  return (
    <main className="py-6">
      <PageContainer>
        <section className="card-soft flex flex-col items-start gap-4 p-8">
          <h1 className="text-2xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
          <Link href="/" className={buttonVariants({ size: 'lg' })}>
            {t('home')}
          </Link>
        </section>
      </PageContainer>
    </main>
  );
};

export default NotFoundPage;
