import { createClient, type SanityClient } from '@sanity/client';
import { apiVersion, dataset, isSanityConfigured, projectId } from './env';

/**
 * A configured Sanity client, or null when Sanity is not set up yet.
 *
 * useCdn: true → reads hit Sanity's edge cache (fast, free-tier friendly).
 * For a static site that only fetches at BUILD time this is ideal; the
 * cache can lag a few seconds behind a publish, which a rebuild never notices.
 */
export const client: SanityClient | null = isSanityConfigured
  ? createClient({ projectId, dataset, apiVersion, useCdn: true, perspective: 'published' })
  : null;
