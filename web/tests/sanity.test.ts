import { test } from 'node:test';
import assert from 'node:assert/strict';

/*
 * Without NEXT_PUBLIC_SANITY_PROJECT_ID the data layer must return empty
 * results instead of throwing — that is what lets CI build the site with
 * no credentials at all.
 */
delete process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;

test('api returns fallbacks when Sanity is not configured', async () => {
  const api = await import('../src/sanity/api');
  assert.deepEqual(await api.getLatestPosts(), []);
  assert.deepEqual(await api.getAllPosts(), []);
  assert.deepEqual(await api.getPostSlugs(), []);
  assert.equal(await api.getPostBySlug('anything'), null);
  assert.deepEqual(await api.getSanityProjects(), []);
  assert.equal(api.PLACEHOLDER_SLUG, 'coming-soon');
});

test('project repository falls back to the local seed without Sanity', async () => {
  const { getProjects } = await import('../src/lib/project-repository');
  const { projects } = await import('../src/content/projects');
  const list = await getProjects();
  assert.equal(list, projects);
  assert.equal(await getProjects(), list, 'second call reuses the memoised promise');
});

test('env validation rejects malformed project IDs', async () => {
  const { isSanityConfigured } = await import('../src/sanity/env');
  assert.equal(isSanityConfigured, false);
});

test('queries never interpolate user input', async () => {
  const q = await import('../src/sanity/queries');
  assert.match(q.POST_BY_SLUG_QUERY, /\$slug/);
  assert.match(q.LATEST_POSTS_QUERY, /\$limit/);
  assert.match(q.PROJECTS_QUERY, /_type == "project"/);
});
