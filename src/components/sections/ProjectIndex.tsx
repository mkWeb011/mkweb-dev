'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { countByTag, filterByTag, platformLabel, type TagFilter } from '@/lib/projects';
import type { Project } from '@/lib/types';
import { SectionHead } from '@/components/ui/SectionHead';
import styles from './ProjectIndex.module.css';

/**
 * Every project in a filterable index.
 *
 * Only ONE piece of state: the selected tag. Everything else (visible list,
 * counts) is DERIVED from props + that state during render. Storing the
 * filtered list in state too would be duplicated state that can go out of sync.
 */
export function ProjectIndex({ projects }: { projects: Project[] }) {
  const [tag, setTag] = useState<TagFilter>('All');

  // useMemo: recompute only when inputs change. With 18 items this is not a
  // performance need — it documents that the value is derived.
  const tags = useMemo(() => countByTag(projects), [projects]);
  const visible = useMemo(() => filterByTag(projects, tag), [projects, tag]);

  return (
    <section className={styles.section} id="archive" aria-labelledby="arc-h">
      <SectionHead index="02 / Index" title="Every" accent="project" aside={`${projects.length} projects`} id="arc-h" />

      <div className={styles.filters} role="group" aria-label="Filter projects by platform">
        {tags.map(({ tag: t, count }) => (
          <button key={t} type="button" className={styles.chip} aria-pressed={t === tag} onClick={() => setTag(t)}>
            {t}
            <sup>{count}</sup>
          </button>
        ))}
      </div>

      <div className={`${styles.head} mono muted`} aria-hidden="true">
        <span>#</span>
        <span>Project</span>
        <span>Work</span>
        <span>Platform</span>
        <span />
      </div>

      <ul>
        {visible.map((project) => (
          <li key={project.slug} data-reveal="arc">
            <Link className={styles.row} href={`/work/${project.slug}/`}>
              <span className="mono muted">{String(projects.indexOf(project) + 1).padStart(2, '0')}</span>
              <span className={styles.name}>{project.name}</span>
              <span className={styles.what}>{project.summary}</span>
              <span className={`${styles.platform} mono muted`}>{platformLabel(project)}</span>
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Screen readers hear the result of a filter change. */}
      <p className="sr-only" aria-live="polite">
        {visible.length} projects shown
      </p>
    </section>
  );
}
