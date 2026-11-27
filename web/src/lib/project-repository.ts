import { projects as localProjects } from '@/content/projects';
import { normalizeProject } from '@/lib/projects';
import type { Project } from '@/lib/types';
import { getSanityProjects } from '@/sanity/api';

/*
 * Project repository — the ONLY place that knows where projects come from.
 *
 *   Sanity has ≥1 valid project → Sanity is the source (edit in Studio).
 *   Sanity empty / not configured → content/projects.ts (the local seed).
 *
 * Server-only: it imports the Sanity client, which must never end up in
 * the browser bundle. Client components receive projects as props instead.
 */

let cached: Promise<Project[]> | null = null;

/**
 * All projects in site order. The promise is memoised: during one build the
 * home page, every case page and the sitemap share ONE Sanity request.
 */
export function getProjects(): Promise<Project[]> {
  cached ??= loadProjects();
  return cached;
}

async function loadProjects(): Promise<Project[]> {
  const raw = await getSanityProjects();
  const fromSanity = raw.map(normalizeProject).filter((p): p is Project => p !== null);
  return fromSanity.length > 0 ? fromSanity : localProjects;
}

/** Test helper: forget the memoised list so the next call loads again. */
export function resetProjectsCache(): void {
  cached = null;
}
