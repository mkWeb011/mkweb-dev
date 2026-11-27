import Link from 'next/link';
import { site } from '@/content/site';

export function Footer() {
  // Runs at build time for a static export — the year is "frozen" at build.
  // Fine here: every deploy rebuilds the site.
  const year = new Date().getFullYear();

  return (
    <footer className="foot wrap mono">
      <span>
        © {year} {site.name}
      </span>
      <nav aria-label="Footer">
        <Link href="/#work">Work</Link>
        <Link href="/#about">About</Link>
        <Link href="/#experience">Experience</Link>
        <Link href="/blog/">Writing</Link>
        <Link href="/#top">Top ↑</Link>
      </nav>
    </footer>
  );
}
