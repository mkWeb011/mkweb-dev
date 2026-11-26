import Link from 'next/link';
import { site } from '@/content/site';
import { HeroCanvas } from '@/components/motion/HeroCanvas';

const CORE = ['9+ years', 'WordPress', 'Webflow', 'Next.js', 'Headless CMS', 'CI/CD & hosting', 'Technical SEO'];

/**
 * Server Component. The only interactive piece, <HeroCanvas>, is a Client
 * Component — React sends JavaScript just for that island, not for the text.
 */
export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-name">
      <HeroCanvas />
      <div className="hero-top">
        <p className="hero-role mono muted">
          {site.role}
          <br />
          {site.location}
        </p>
        <p className="hero-intro">
          I build, migrate and run websites and web apps where engineering meets <em>design</em> — WordPress and
          Webflow, headless CMS on Next.js, and the CI/CD, hosting and SEO behind them.
        </p>
      </div>
      <div>
        <h1 className="hero-name" id="hero-name">
          {site.name}
        </h1>
        <div className="hero-foot">
          <ul className="mono muted" aria-label="Core areas">
            {CORE.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link className="scroll-cue mono muted" href="/#work">
            <i aria-hidden="true" />
            Selected work
          </Link>
        </div>
      </div>
    </section>
  );
}
