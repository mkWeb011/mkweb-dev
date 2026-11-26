/**
 * Sanity settings from environment variables.
 *
 * NEXT_PUBLIC_* variables are inlined into the bundle at build time.
 * Project ID and dataset are public identifiers (anyone can see them in
 * network requests), so that is safe. Tokens would NOT be.
 */
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '';
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';

/**
 * API version = a date. Sanity freezes API behaviour at that date, so a
 * future breaking change on their side cannot silently break this site.
 */
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2026-02-01';

/** False until a project ID is configured → the site uses local fallbacks. */
export const isSanityConfigured = /^[a-z0-9-]+$/.test(projectId);
