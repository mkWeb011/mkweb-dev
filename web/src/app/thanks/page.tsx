import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * Landing page for the no-JavaScript path of the "Start a project" form:
 * the browser POSTs natively to the Worker (/api/inquiry), which sends the
 * email and answers with a 303 redirect here. With JS the success message
 * shows inline instead.
 */
export const metadata: Metadata = {
  title: 'Brief received',
  robots: { index: false },
};

export default function ThanksPage() {
  return (
    <section className="post-page">
      <p className="mono muted">Start a project</p>
      <h1>
        Thanks — <span className="serif">brief received.</span>
      </h1>
      <p className="post-lead">
        I&apos;ll read it properly and reply by email with questions and a suggested next step.{' '}
        <Link href="/#work">Back to the work</Link>.
      </p>
    </section>
  );
}
