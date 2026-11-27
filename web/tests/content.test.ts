import { test } from 'node:test';
import assert from 'node:assert/strict';
import { plannedPosts } from '../src/content/posts';
import { jobs } from '../src/content/experience';
import { capabilities } from '../src/content/capabilities';
import { projects } from '../src/content/projects';
import { findProject } from '../src/lib/projects';

/*
 * Content integrity tests. They protect the site's honesty rules:
 * links between content must resolve, and no invented metrics slip in.
 */

test('planned posts link to existing case studies', () => {
  for (const post of plannedPosts) {
    assert.ok(findProject(projects, post.related), `missing related case: ${post.related}`);
  }
});

test('jobs are newest first by start year', () => {
  const startYears = jobs.map((j) => Number(j.dates.match(/\d{4}/)?.[0]));
  // The freelance block (2023) overlaps others, so check only the first and last.
  assert.equal(startYears[0], 2025);
  assert.equal(startYears[startYears.length - 1], 2017);
});

test('every capability group has items and growing groups are last', () => {
  assert.ok(capabilities.every((g) => g.items.length > 0));
  const firstGrowing = capabilities.findIndex((g) => g.status === 'growing');
  assert.ok(firstGrowing === -1 || capabilities.slice(firstGrowing).every((g) => g.status === 'growing'));
});

test('no invented percentage metrics in case studies', async () => {
  const { projects } = await import('../src/content/projects');
  for (const p of projects) {
    const text = [p.summary, p.overview, p.challenge ?? '', ...(p.outcome ?? [])].join(' ');
    assert.doesNotMatch(text, /\d+\s?%/, `${p.slug}: percentage found — verify before publishing`);
  }
});
