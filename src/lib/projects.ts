import { projects } from '@/content/projects';
import { PROJECT_TAGS, type Project, type ProjectTag } from '@/lib/types';

/**
 * Small, pure functions over the project list.
 * Pure = same input, same output, no side effects → trivial to unit-test.
 */

export function getAllProjects(): Project[] {
  return projects;
}

export function getFeaturedProjects(): Project[] {
  return projects.filter((p) => p.featured);
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

/** 1-based position, zero-padded: 3 → "03". Used for "Case 03 / 18". */
export function projectNumber(project: Project, list: Project[] = projects): string {
  return String(list.indexOf(project) + 1).padStart(2, '0');
}

/** The project after this one, wrapping around to the first. */
export function getNextProject(project: Project, list: Project[] = projects): Project {
  const index = list.indexOf(project);
  // `list[...]` is `Project | undefined` because of noUncheckedIndexedAccess.
  return list[(index + 1) % list.length] ?? project;
}

export type TagFilter = ProjectTag | 'All';

/** How many projects carry each tag. Tags with 0 projects are dropped. */
export function countByTag(list: Project[] = projects): { tag: TagFilter; count: number }[] {
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
