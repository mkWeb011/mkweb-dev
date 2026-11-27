import type { CSSProperties } from 'react';
import Image from 'next/image';
import { hostOf } from '@/lib/format';
import type { Project } from '@/lib/types';
import { urlFor } from '@/sanity/image';

/**
 * Generated placeholder visual for a project: browser bar + big mark + orb.
 * Replaceable: add a cover image to the project in Sanity and it is used instead.
 * `--h` is a CSS custom property; React needs a cast because TypeScript's
 * CSSProperties type does not know custom properties.
 */
export function ProjectVisual({ project }: { project: Project }) {
  // A real screenshot from Sanity wins over the generated placeholder.
  if (project.cover) {
    return (
      <div className="pv pv-photo">
        <Image
          src={urlFor(project.cover).width(1600).height(1000).fit('crop').url()}
          alt={project.cover.alt ?? `${project.name} — website screenshot`}
          width={1600}
          height={1000}
          sizes="(max-width: 860px) 100vw, 60vw"
        />
      </div>
    );
  }

  const host = project.links[0] ? hostOf(project.links[0].url) : 'private project';
  const style = { '--h': project.hue } as CSSProperties;

  return (
    <div
      className="pv"
      style={style}
      role="img"
      aria-label={`Visual for ${project.name} — placeholder until a screenshot is added`}
    >
      <div className="pv-orb" />
      <div className="pv-bar">
        <i />
        <i />
        <i />
        &nbsp;{host}
      </div>
      <div className="pv-mark">{project.mark}</div>
      <div className="pv-k">
        {(project.stack ?? ['Stack TBC']).slice(0, 3).map((s) => (
          <span key={s} style={{ display: 'block' }}>
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}
