import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { schemaTypes } from './schemaTypes';

/**
 * Sanity Studio configuration — the "wp-admin" of this site.
 * structureTool = the document list/editor UI.
 * visionTool    = a GROQ playground: test queries before putting them in code.
 */
export default defineConfig({
  name: 'default',
  title: 'Marko Kostić — Content',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID ?? '',
  dataset: process.env.SANITY_STUDIO_DATASET ?? 'production',
  plugins: [structureTool(), visionTool()],
  schema: { types: schemaTypes },
});
