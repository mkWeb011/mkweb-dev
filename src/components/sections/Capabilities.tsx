import type { CapabilityGroup } from '@/lib/types';
import { SectionHead } from '@/components/ui/SectionHead';

/**
 * Horizontal track of capability cards. On desktop SiteMotion pins the
 * section and scrolls the track sideways; on mobile it is a vertical stack.
 * The component itself is static — motion is layered on top.
 */
export function Capabilities({ groups }: { groups: CapabilityGroup[] }) {
  return (
    <section className="caps" id="capabilities" aria-labelledby="caps-h">
      <SectionHead
        index="03 / Capabilities"
        title="What I bring to a"
        accent="build"
        aside="Skill → where it was proven"
        id="caps-h"
      />
      <div className="caps-pin" data-caps-pin>
        <div className="caps-track" data-caps-track>
          {groups.map((group, i) => (
            <article
              key={group.title + (group.accent ?? '')}
              className={`cap${group.status === 'growing' ? ' growing' : ''}`}
            >
              <div className="cap-n mono muted">
                <span>{String(i + 1).padStart(2, '0')}</span>
                <span>{group.status === 'growing' ? 'Actively advancing' : 'Proven'}</span>
              </div>
              <div>
                <h3>
                  {group.title}
                  {group.accent && <span className="serif">{group.accent}</span>}
                </h3>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <span>{item.label}</span>
                      <span>{item.proof}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
