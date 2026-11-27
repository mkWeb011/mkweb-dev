import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { findProject, getNextProject, projectNumber } from '@/lib/projects';
import { getProjects } from '@/lib/project-repository';
import { ProjectVisual } from '@/components/ui/ProjectVisual';
import { ToConfirm } from '@/components/ui/ToConfirm';
import { AvailablePill } from '@/components/ui/AvailablePill';

/*
 * Dynamic route: one file → one page per project.
 * The folder name [slug] becomes a parameter. With `output: 'export'`
 * every possible slug must be known at build time → generateStaticParams.
 */

// Next.js 16: params is a Promise — always `await` it.
type Props = { params: Promise<{ slug: string }> };

// Only the slugs listed below exist; anything else is a 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(await getProjects(), slug);
  if (!project) return {};
  return {
    title: `${project.name} — case study`,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}/` },
    openGraph: { title: `${project.name} — case study`, description: project.summary, type: 'article' },
  };
}

/** Small layout helper: a labelled row of the case study. */
function Section({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section className="cs-sec">
      <h2 className="mono">{label}</h2>
      <div className="cs-body">{children}</div>
    </section>
  );
}

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const all = await getProjects();
  const project = findProject(all, slug);
  if (!project) notFound(); // renders app/not-found.tsx

  const next = getNextProject(project, all);

  return (
    <article className="case">
      <div className="case-top">
        <span className="mono muted">
          Case {projectNumber(project, all)} / {all.length}
        </span>
        <Link className="pill" href="/#work">
          ← All work
        </Link>
      </div>

      <p className="mono muted">{project.tags.join(' · ')}</p>
      <h1>{project.name}</h1>
      <p className="case-sub">{project.summary}</p>

      <dl className="cs-meta">
        <div>
          <dt className="mono">Client</dt>
          <dd>{project.client ?? <ToConfirm />}</dd>
        </div>
        <div>
          <dt className="mono">Engagement</dt>
          <dd>{project.engagement ?? <ToConfirm />}</dd>
        </div>
        <div>
          <dt className="mono">Period</dt>
          <dd>{project.period ?? <ToConfirm />}</dd>
        </div>
        <div>
          <dt className="mono">My role</dt>
          <dd>{project.role}</dd>
        </div>
      </dl>

      <div className="case-visual">
        <ProjectVisual project={project} />
      </div>

      <Section label="Overview">
        <p className="cs-lead">{project.overview}</p>
      </Section>

      <Section label="The challenge">
        {project.challenge ? <p>{project.challenge}</p> : <ToConfirm label="Brief to be confirmed" />}
      </Section>

      <Section label="Approach">
        {project.approach.length > 0 ? (
          <ol className="steps">
            {project.approach.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
        ) : (
          <ToConfirm label="Approach to be written" />
        )}
      </Section>

      <Section label="What I delivered">
        {project.delivered.length > 0 ? (
          <ul className="deliv">
            {project.delivered.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <ToConfirm label="Deliverables to be confirmed" />
        )}
      </Section>

      <Section label="Stack">
        {project.stack ? (
          <ul className="chips">
            {project.stack.map((tech) => (
              <li key={tech}>{tech}</li>
            ))}
          </ul>
        ) : (
          <ToConfirm label="Stack to be confirmed" />
        )}
      </Section>

      <Section label="Verified outcomes">
        {project.outcome && (
          <ul className="deliv out">
            {project.outcome.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        )}
        <p className="cs-note">
          <ToConfirm label="Metrics pending verification" />
          <span className="muted">Performance and business figures are published only once confirmed.</span>
        </p>
      </Section>

      <div className="case-foot">
        {project.links.length > 0 ? (
          <div className="case-links">
            {project.links.map((link) => (
              <a key={link.url} className="big" href={link.url} target="_blank" rel="noopener noreferrer">
                {link.label}{' '}
                <span className="arr" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        ) : (
          <span className="mono muted">Private / not publicly linked</span>
        )}
        <Link className="pill" href={`/work/${next.slug}/`}>
          Next: {next.name} →
        </Link>
      </div>

      <div className="case-cta">
        <p className="mono muted">Similar project in mind?</p>
        <AvailablePill />
      </div>
    </article>
  );
}
