import { notFound } from 'next/navigation';

/*
 * Every path under a locale that no route claims ends here, so the localized
 * not-found page renders inside the locale layout instead of the framework's
 * bare default; a 404 thrown from the root layout never reaches it.
 */
const CatchAllPage = (): never => notFound();

export default CatchAllPage;
