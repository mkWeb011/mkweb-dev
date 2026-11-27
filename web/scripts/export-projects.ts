/**
 * One-time migration: content/projects.ts → Sanity.
 *
 *   npm run seed:projects            (in web/)  → writes studio/seed/projects.ndjson
 *   npm run import:projects          (in studio/) → uploads it to the dataset
 *
 * NDJSON = one JSON document per line — the format `sanity dataset import`
 * reads. Running the import again is safe: fixed _id values
 * ("project-<slug>") make it overwrite the same documents, not duplicate them.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects } from '../src/content/projects';
import type { Project } from '../src/lib/types';

/** Sanity needs a unique `_key` on every object inside an array. */
const key = (prefix: string, i: number) => `${prefix}${i}`;

export function toSanityDocument(project: Project, index: number) {
  return {
    _id: `project-${project.slug}`,
    _type: 'project',
    name: project.name,
    slug: { _type: 'slug', current: project.slug },
    order: (index + 1) * 10, // gaps: 10, 20, 30 … leave room to slot new projects in
    featured: project.featured,
    tags: project.tags,
    summary: project.summary,
    client: project.client ?? undefined,
    engagement: project.engagement ?? undefined,
    period: project.period ?? undefined,
    role: project.role,
    overview: project.overview,
    challenge: project.challenge ?? undefined,
    approach: project.approach.map((step, i) => ({ _key: key('step', i), _type: 'step', ...step })),
    delivered: project.delivered,
    stack: project.stack ?? undefined,
    outcome: project.outcome ?? undefined,
    links: project.links.map((link, i) => ({ _key: key('link', i), _type: 'link', ...link })),
    hue: project.hue,
    mark: project.mark,
  };
}

// Run only when executed directly (not when imported by a test).
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = resolve(dirname(fileURLToPath(import.meta.url)), '../../studio/seed/projects.ndjson');
  mkdirSync(dirname(out), { recursive: true });
  // JSON.stringify drops `undefined` fields → empty optional fields are simply absent.
  writeFileSync(out, projects.map((p, i) => JSON.stringify(toSanityDocument(p, i))).join('\n') + '\n');
  console.log(`Wrote ${projects.length} projects → ${out}`);
}
