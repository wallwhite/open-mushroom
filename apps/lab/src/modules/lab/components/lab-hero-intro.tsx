import { useTranslations } from 'next-intl';

/* The top of the hero's left column: whose face this is and what the package does, in one line. */
export const LabHeroIntro = () => {
  const t = useTranslations('lab.hero');

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">{t('title')}</h1>
      <p className="max-w-[40rem] text-lg text-pretty text-muted-foreground">{t('subtitle')}</p>
    </div>
  );
};
