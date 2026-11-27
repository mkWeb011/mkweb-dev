import type { Post } from '@/lib/types';
import { client } from './client';
import { ALL_POSTS_QUERY, LATEST_POSTS_QUERY, POST_BY_SLUG_QUERY, POST_SLUGS_QUERY, PROJECTS_QUERY } from './queries';

/**
 * Data-access functions. Pages call THESE, never the client directly.
 * (Same idea as a repository in Laravel or a WP_Query wrapper in a theme.)
 *
 * Every function degrades gracefully: no Sanity config or a network error
 * → empty result + a warning in the build log, never a crashed build.
 */

async function safeFetch<T>(query: string, params: Record<string, unknown>, fallback: T): Promise<T> {
  if (!client) return fallback;
  try {
    return await client.fetch<T>(query, params);
  } catch (error) {
    console.warn('[sanity] fetch failed, using fallback:', error instanceof Error ? error.message : error);
    return fallback;
  }
}

export function getLatestPosts(limit = 6): Promise<Post[]> {
  return safeFetch<Post[]>(LATEST_POSTS_QUERY, { limit }, []);
}

export function getAllPosts(): Promise<Post[]> {
  return safeFetch<Post[]>(ALL_POSTS_QUERY, {}, []);
}

export function getPostSlugs(): Promise<string[]> {
  return safeFetch<string[]>(POST_SLUGS_QUERY, {}, []);
}

export function getPostBySlug(slug: string): Promise<Post | null> {
  return safeFetch<Post | null>(POST_BY_SLUG_QUERY, { slug }, null);
}

/**
 * Raw project documents. Typed as `unknown` on purpose: editors can leave
 * fields empty, so the shape is checked and repaired in lib/projects.ts
 * (normalizeProject) before any component sees it.
 */
export function getSanityProjects(): Promise<unknown[]> {
  return safeFetch<unknown[]>(PROJECTS_QUERY, {}, []);
}

/**
 * `output: 'export'` refuses a dynamic route whose generateStaticParams
 * returns []. Before the first post is published we emit one placeholder
 * page that tells visitors writing is on the way (and is noindex).
 */
export const PLACEHOLDER_SLUG = 'coming-soon';
