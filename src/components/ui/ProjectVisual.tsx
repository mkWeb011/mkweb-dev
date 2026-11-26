import type { CSSProperties } from 'react';
import { hostOf } from '@/lib/format';
import type { Project } from '@/lib/types';

/**
 * Generated placeholder visual for a project: browser bar + big mark + orb.
 * Marked as replaceable — swap for a real screenshot (next/image) later.
 * `--h` is a CSS custom property; React needs a cast because TypeScript's
 * CSSProperties type does not know custom properties.
 */
export function ProjectVisual({ project }: { project: Project }) {
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
