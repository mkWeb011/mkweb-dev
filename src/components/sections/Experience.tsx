import type { Job } from '@/lib/types';
import { SectionHead } from '@/components/ui/SectionHead';

export function Experience({ jobs }: { jobs: Job[] }) {
  return (
    <section className="exp" id="experience" aria-labelledby="exp-h">
      <SectionHead
        index="05 / Experience"
        title="Where the work"
        accent="happened"
        aside={`2017 — Present · ${jobs.length} roles`}
        id="exp-h"
      />
      <div className="tl" data-timeline>
        <div className="tl-line" aria-hidden="true">
          <i data-timeline-progress />
        </div>
        {jobs.map((job) => (
          <article className="job" key={job.company + job.dates}>
            <div className="job-when">
              <p className="yrs">{job.years}</p>
              <span className="mono">{job.dates}</span>
            </div>
            <div className="job-main">
              <h3>{job.company}</h3>
              <p className="role">{job.role}</p>
              <ul>
                {job.highlights.map((h) => (
                  <li key={h}>{h}</li>
                ))}
              </ul>
            </div>
            <p className="job-kind mono">{job.kind}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
