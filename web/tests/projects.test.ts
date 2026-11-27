import { test } from 'node:test';
import assert from 'node:assert/strict';
import { projects as all } from '../src/content/projects';
import {
  countByTag,
  filterByTag,
  findProject,
  getFeaturedProjects,
  getNextProject,
  initials,
  normalizeProject,
  platformLabel,
  projectNumber,
} from '../src/lib/projects';

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
  const featured = getFeaturedProjects(all);
  assert.ok(featured.length >= 5 && featured.length <= 8);
  assert.deepEqual(
    featured.map((p) => p.slug),
    all.filter((p) => p.featured).map((p) => p.slug),
  );
});

test('lookup by slug', () => {
  assert.equal(findProject(all, 'idsa')?.name, 'IDSA');
  assert.equal(findProject(all, 'does-not-exist'), undefined);
});

test('projectNumber is 1-based and zero-padded', () => {
  const first = all[0]!;
  assert.equal(projectNumber(first, all), '01');
});

test('getNextProject wraps around', () => {
  const last = all[all.length - 1]!;
  assert.equal(getNextProject(last, all).slug, all[0]!.slug);
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
  const zignify = findProject(all, 'zignify')!;
  assert.equal(platformLabel(zignify), 'WordPress');
});

// --- normalizeProject: what the site does with half-filled CMS documents ---

test('normalizeProject rejects documents without slug or name', () => {
  assert.equal(normalizeProject(null), null);
  assert.equal(normalizeProject({ name: 'No slug' }), null);
  assert.equal(normalizeProject({ slug: 'no-name', name: '   ' }), null);
});

test('normalizeProject fills safe defaults for empty fields', () => {
  const p = normalizeProject({ slug: 'new-site', name: 'Social Hype', tags: ['Webflow', 'Bogus', 42] })!;
  assert.equal(p.mark, 'SH');
  assert.equal(p.hue, 210);
  assert.equal(p.featured, false);
  assert.deepEqual(p.tags, ['Webflow']);
  assert.equal(p.client, null);
  assert.equal(p.stack, null);
  assert.deepEqual(p.approach, []);
  assert.deepEqual(p.links, []);
  assert.equal(p.cover, null);
});

test('normalizeProject drops incomplete approach steps and links', () => {
  const p = normalizeProject({
    slug: 's',
    name: 'S',
    approach: [{ title: 'Plan', description: 'Map it' }, { title: 'Half' }],
    links: [{ label: 'Live', url: 'https://example.com' }, { label: 'Broken' }],
  })!;
  assert.equal(p.approach.length, 1);
  assert.deepEqual(p.links, [{ label: 'Live', url: 'https://example.com' }]);
});

test('initials', () => {
  assert.equal(initials('Zignify'), 'Zi');
  assert.equal(initials('MC Adventure'), 'MA');
});

test('local seed survives a round trip through normalizeProject', () => {
  for (const p of all) {
    const back = normalizeProject(p)!;
    assert.equal(back.slug, p.slug);
    assert.deepEqual(back.approach, p.approach);
    assert.deepEqual(back.tags, p.tags);
  }
});

test('seed export produces stable ids, slug objects and array keys', async () => {
  const { toSanityDocument } = await import('../scripts/export-projects');
  const doc = toSanityDocument(all[0]!, 0);
  assert.equal(doc._id, `project-${all[0]!.slug}`);
  assert.deepEqual(doc.slug, { _type: 'slug', current: all[0]!.slug });
  assert.equal(doc.order, 10);
  assert.ok(doc.approach.every((s) => typeof s._key === 'string'));
  // And Sanity's shape normalises back to the same project:
  const back = normalizeProject({ ...doc, slug: doc.slug.current })!;
  assert.deepEqual(back.approach, all[0]!.approach);
});
