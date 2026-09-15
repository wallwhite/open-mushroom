/* Public URLs of the project; APP_URL is the deployed origin (used for canonical links and the sitemap). */
export const siteConfig = {
  name: 'Open Mushroom',
  repoUrl: 'https://github.com/wallwhite/open-mushroom',
  npmUrl: 'https://www.npmjs.com/package/open-mushroom',
  siteUrl: process.env.APP_URL ?? 'http://localhost:3001',
} as const;
