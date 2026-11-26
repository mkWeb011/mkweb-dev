import Image from 'next/image';
import { site } from '@/content/site';
import type { Credential } from '@/lib/types';
import { SectionHead } from '@/components/ui/SectionHead';

const FACTS: [string, string][] = [
  ['Based', 'Belgrade — remote, CET'],
  ['Experience', '9+ years, since 2017'],
  ['Clients in', 'US · EU · UK · CA · UAE'],
  ['Languages', 'English · Serbian'],
];

export function About({ credentials }: { credentials: Credential[] }) {
  return (
    <section className="about" id="about" aria-labelledby="about-h">
      <SectionHead
        index="04 / About"
        title="The short"
        accent="version"
        aside="Engineer, not a template"
        id="about-h"
      />
      <div className="about-grid">
        {/*
          next/image: reserves space (width/height → no layout shift) and lazy-loads.
          With `images.unoptimized` (static export) it serves the file as-is, so the
          WebP is pre-graded and pre-sized (720×900, 2× for a 360 px column).
        */}
        <figure className="portrait" data-reveal="portrait">
          <div className="portrait-frame">
            <Image
              src="/images/marko-kostic.webp"
              alt="Marko Kostić, independent web engineer, portrait"
              width={720}
              height={900}
              sizes="(max-width: 860px) 300px, 360px"
            />
          </div>
          <figcaption className="mono">
            <span>{site.name}</span>
            {site.available && (
              <span>
                <span className="dot" aria-hidden="true" />
                Belgrade
              </span>
            )}
          </figcaption>
        </figure>
        <p className="about-lead" id="about-lead">
          Formal web development training first. Then nine years of delivery for agencies, product teams and direct
          clients — from building themes inside a team to <span className="serif">leading web development</span> and
          owning whole stacks.
        </p>
        <div className="about-body">
          <p>
            I started as a full-stack developer and UI/UX designer on a product team, spent three years at a Washington,
            DC agency building WordPress for associations and enterprises, and have since led web development for
            agencies and owned client stacks end to end.
          </p>
          <p>
            Most of my work is WordPress and WooCommerce — themes, blocks, migrations, integrations — with Webflow and
            Next.js where they fit better. I also handle what sits around the site: hosting, DNS, email deliverability,
            tracking, CRM and the automation that ties them together.
          </p>
          <p>
            I care about handover as much as launch: a site the client can run, documented, with someone who answers
            when something breaks.
          </p>
        </div>
        <dl className="facts mono">
          {FACTS.map(([term, value]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{value}</dd>
            </div>
          ))}
          {site.available && (
            <div>
              <dt>Status</dt>
              <dd>
                <span className="dot" style={{ marginRight: 8 }} aria-hidden="true" />
                Available
              </dd>
            </div>
          )}
        </dl>
        <div className="edu">
          <h3 className="mono muted">Education &amp; certifications</h3>
          <ul>
            {credentials.map((c) => (
              <li key={c.title}>
                <span>{c.title}</span>
                <span className="mono muted">{c.meta}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
