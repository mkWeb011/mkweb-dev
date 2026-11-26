import { SectionHead } from '@/components/ui/SectionHead';
import { SignalWave } from '@/components/motion/SignalWave';

/** Independent work, clearly separated from client projects. */
export function Lab() {
  return (
    <section className="lab" id="lab" aria-labelledby="lab-h">
      <SectionHead index="06 / Experiments" title="Independent" accent="work" aside="Not client work" id="lab-h" />
      <article className="lab-card">
        <SignalWave />
        <h3>
          Balkan<span className="serif">Signal</span>
        </h3>
        <div className="lab-meta">
          <p className="mono muted">Independent product · In development</p>
          <p className="muted" style={{ fontSize: 'var(--fs-m)', maxWidth: '36ch' }}>
            A self-initiated product built outside client work. A public version and write-up will appear here once
            it&apos;s ready to show.
          </p>
          <span className="tbv">Public preview — coming soon</span>
        </div>
      </article>
    </section>
  );
}
