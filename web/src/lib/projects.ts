import { PROJECT_TAGS, type Project, type ProjectTag, type SanityImage } from '@/lib/types';

/*
 * Pure project helpers — safe to import from client components
 * (ProjectIndex uses them in the browser). Nothing here fetches data:
 * loading lives in lib/project-repository.ts (server only).
 */

// ---------------------------------------------------------------------------
// Normalising CMS data
// ---------------------------------------------------------------------------

const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim() !== '' ? v.trim() : null);
const strList = (v: unknown): string[] =>
  Array.isArray(v) ? v.map(str).filter((s): s is string => s !== null) : [];
const isTag = (v: string): v is ProjectTag => (PROJECT_TAGS as readonly string[]).includes(v);

/** "Social Hype" → "SH", "Zignify" → "Zi". */
export function initials(name: string): string {
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return (words[0]![0]! + words[1]![0]!).toUpperCase();
  return name.slice(0, 2);
}

/**
 * Turn one raw Sanity document into a valid Project — or null if it lacks
 * the minimum (slug + name). Editors can leave optional fields empty;
 * this is the single place that decides what "empty" means for the UI.
 */
export function normalizeProject(raw: unknown): Project | null {
  if (!isRecord(raw)) return null;
  const slug = str(raw.slug);
  const name = str(raw.name);
  if (!slug || !name) return null;

  const hue = typeof raw.hue === 'number' && raw.hue >= 0 && raw.hue <= 360 ? raw.hue : 210;
  const stack = strList(raw.stack);
  const outcome = strList(raw.outcome);

  return {
    slug,
    name,
    hue,
    mark: str(raw.mark) ?? initials(name),
    featured: raw.featured === true,
    tags: strList(raw.tags).filter(isTag),
    summary: str(raw.summary) ?? '',
    client: str(raw.client),
    engagement: str(raw.engagement),
    period: str(raw.period),
    role: str(raw.role) ?? '',
    overview: str(raw.overview) ?? '',
    challenge: str(raw.challenge),
    approach: (Array.isArray(raw.approach) ? raw.approach : []).filter(isRecord).flatMap((step) => {
      const title = str(step.title);
      const description = str(step.description);
      return title && description ? [{ title, description }] : [];
    }),
    delivered: strList(raw.delivered),
    stack: stack.length ? stack : null,
    outcome: outcome.length ? outcome : null,
    links: (Array.isArray(raw.links) ? raw.links : []).filter(isRecord).flatMap((link) => {
      const label = str(link.label);
      const url = str(link.url);
      return label && url ? [{ label, url }] : [];
    }),
    cover: isRecord(raw.cover) && isRecord(raw.cover.asset) ? (raw.cover as unknown as SanityImage) : null,
  };
}

// ---------------------------------------------------------------------------
// Pure helpers over a list
// ---------------------------------------------------------------------------

export function getFeaturedProjects(list: Project[]): Project[] {
  return list.filter((p) => p.featured);
}

export function findProject(list: Project[], slug: string): Project | undefined {
  return list.find((p) => p.slug === slug);
}

/** 1-based position, zero-padded: 3 → "03". Used for "Case 03 / 18". */
export function projectNumber(project: Project, list: Project[]): string {
  return String(list.indexOf(project) + 1).padStart(2, '0');
}

/** The project after this one, wrapping around to the first. */
export function getNextProject(project: Project, list: Project[]): Project {
  const index = list.indexOf(project);
  // `list[...]` is `Project | undefined` because of noUncheckedIndexedAccess.
  return list[(index + 1) % list.length] ?? project;
}

export type TagFilter = ProjectTag | 'All';

/** How many projects carry each tag. Tags with 0 projects are dropped. */
export function countByTag(list: Project[]): { tag: TagFilter; count: number }[] {
  const counts: { tag: TagFilter; count: number }[] = [{ tag: 'All', count: list.length }];
  for (const tag of PROJECT_TAGS) {
    const count = list.filter((p) => p.tags.includes(tag)).length;
    if (count > 0) counts.push({ tag, count });
  }
  return counts;
}

export function filterByTag(list: Project[], tag: TagFilter): Project[] {
  return tag === 'All' ? list : list.filter((p) => p.tags.includes(tag));
}

/** Platform label for the index: tags minus the "service" ones. */
export function platformLabel(project: Project): string {
  const services: ProjectTag[] = ['SEO', 'Automation'];
  const platforms = project.tags.filter((t) => !services.includes(t));
  return (platforms.length ? platforms : project.tags).join(' · ');
}
