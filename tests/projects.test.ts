import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  countByTag,
  filterByTag,
  getAllProjects,
  getFeaturedProjects,
  getNextProject,
  getProjectBySlug,
  platformLabel,
  projectNumber,
} from '../src/lib/projects';

const all = getAllProjects();

test('slugs are unique and URL-safe', () => {
  const slugs = all.map((p) => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug');
  for (const slug of slugs) assert.match(slug, /^[a-z0-9-]+$/, `bad slug: ${slug}`);
});

test('every project has the minimum case-study content', () => {
  for (const p of all) {
    assert.ok(p.summary.length > 20, `${p.slug}: summary too short`);
    assert.ok(p.overview.length > 20, `${p.slug}: overview too short`);
    assert.ok(p.approach.length >= 1, `${p.slug}: no approach steps`);
    assert.ok(p.delivered.length >= 1, `${p.slug}: nothing delivered`);
    assert.ok(p.hue >= 0 && p.hue <= 360, `${p.slug}: hue out of range`);
  }
});

test('featured list is a subset in the original order', () => {
  const featured = getFeaturedProjects();
  assert.ok(featured.length >= 5 && featured.length <= 8);
  assert.deepEqual(
    featured.map((p) => p.slug),
    all.filter((p) => p.featured).map((p) => p.slug),
  );
});

test('lookup by slug', () => {
  assert.equal(getProjectBySlug('idsa')?.name, 'IDSA');
  assert.equal(getProjectBySlug('does-not-exist'), undefined);
});

test('projectNumber is 1-based and zero-padded', () => {
  const first = all[0]!;
  assert.equal(projectNumber(first), '01');
});

test('getNextProject wraps around', () => {
  const last = all[all.length - 1]!;
  assert.equal(getNextProject(last).slug, all[0]!.slug);
});

test('countByTag starts with All and skips empty tags', () => {
  const counts = countByTag(all);
  assert.deepEqual(counts[0], { tag: 'All', count: all.length });
  assert.ok(counts.every((c) => c.count > 0));
});

test('filterByTag returns only matching projects', () => {
  const webflow = filterByTag(all, 'Webflow');
  assert.ok(webflow.length > 0);
  assert.ok(webflow.every((p) => p.tags.includes('Webflow')));
  assert.equal(filterByTag(all, 'All').length, all.length);
});

test('platformLabel hides service tags when platforms exist', () => {
  const zignify = getProjectBySlug('zignify')!;
  assert.equal(platformLabel(zignify), 'WordPress');
});
