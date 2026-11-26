import Link from 'next/link';

/** Rendered for notFound() and unknown URLs (exported as out/404.html). */
export default function NotFound() {
  return (
    <section className="post-page">
      <p className="mono muted">404</p>
      <h1>
        This page is <span className="serif">not here.</span>
      </h1>
      <p className="post-lead">
        It may have moved. Try the <Link href="/#work">selected work</Link> or the <Link href="/blog/">blog</Link>.
      </p>
    </section>
  );
}
