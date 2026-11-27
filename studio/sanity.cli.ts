import { defineCliConfig } from 'sanity/cli';

/** Settings for the `sanity` command line (dev, build, deploy, dataset ...). */
export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
    dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  },
  // `npm run deploy` publishes the Studio to https://<studioHost>.sanity.studio
  studioHost: 'mk-portfolio',
});
