import { site } from '@/content/site';
import { Magnetic } from '@/components/motion/Magnetic';

export function Contact() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-h">
      <div className="contact-top mono muted">
        <span>08 / Contact</span>
        {site.available && (
          <span>
            <span className="dot" style={{ marginRight: 10 }} aria-hidden="true" />
            Available for new projects
          </span>
        )}
      </div>
      <h2 id="contact-h">
        Let&apos;s <span className="serif">talk.</span>
      </h2>
      <div className="contact-cta">
        <Magnetic>
          <a className="call" href={site.meetUrl} target="_blank" rel="noopener noreferrer">
            <span className="dot" aria-hidden="true" />
            Start a Google Meet call
            <span className="arr" aria-hidden="true">
              →
            </span>
          </a>
        </Magnetic>
        <div className="contact-alt mono muted">
          <span>I&apos;m online now — jump straight in.</span>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn ↗
          </a>
        </div>
      </div>
    </section>
  );
}
