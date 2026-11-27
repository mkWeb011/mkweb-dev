'use client';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { gsap, useGSAP, MQ } from '@/lib/gsap';
import type { Project } from '@/lib/types';
import { ProjectVisual } from '@/components/ui/ProjectVisual';
import { SectionHead } from '@/components/ui/SectionHead';

/**
 * Featured case studies as a big editorial list.
 * On desktop a preview card follows the cursor while hovering a row.
 *
 * Data comes in as a prop from the (server) page — this component does not
 * import the content itself. Props in, UI out: easy to reuse and to test.
 */
export function SelectedWork({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState<Project | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const scope = useRef<HTMLElement>(null);

  // useGSAP = useEffect + automatic cleanup of every tween created inside.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.finePointer, () => {
        const el = previewRef.current;
        if (!el) return;
        gsap.set(el, { xPercent: -50, yPercent: -50, scale: 0.8 }); // center on the cursor
        const x = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'power3' });
        const y = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'power3' });
        const move = (e: PointerEvent) => {
          x(e.clientX);
          y(e.clientY);
        };
        window.addEventListener('pointermove', move);
        return () => window.removeEventListener('pointermove', move);
      });
      const el = previewRef.current;
      return () => {
        gsap.killTweensOf(el); // hover tweens are not tracked by useGSAP
      };
    },
    { scope },
  );

  // Plain event handlers: they read the ref only when the pointer moves,
  // never during render. `overwrite` stops overlapping show/hide tweens.
  function show(project: Project) {
    setActive(project);
    gsap.to(previewRef.current, {
      opacity: 1,
      scale: 1,
      rotate: gsap.utils.random(-4, 4),
      duration: 0.6,
      overwrite: 'auto',
    });
  }
  function hide() {
    gsap.to(previewRef.current, { opacity: 0, scale: 0.85, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
  }

  return (
    <section className="work" id="work" aria-labelledby="work-h" ref={scope}>
      <SectionHead
        index="01 / Selected work"
        title="Selected"
        accent="case studies"
        aside="Client work · 2017—now"
        id="work-h"
      />
      <ol className="work-list">
        {projects.map((project, i) => (
          <li key={project.slug}>
            <Link
              className="row"
              href={`/work/${project.slug}/`}
              onPointerEnter={() => show(project)}
              onPointerLeave={hide}
            >
              <span className="n mono">{String(i + 1).padStart(2, '0')}</span>
              <h3>{project.name}</h3>
              <span className="what">{project.summary}</span>
              <span className="tag mono">
                Case study{' '}
                <span className="arr" aria-hidden="true">
                  →
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="preview" ref={previewRef} aria-hidden="true">
        {active && <ProjectVisual project={active} />}
      </div>
    </section>
  );
}
