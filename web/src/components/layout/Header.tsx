'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { site } from '@/content/site';
import { cx } from '@/lib/format';
import { AvailablePill } from '@/components/ui/AvailablePill';
import { Menu } from './Menu';
import styles from './Header.module.css';

/**
 * Fixed header: brand, desktop nav, availability pill and the menu button.
 *
 * State lives here because two children need it:
 *  - the button shows "Menu" / "Close" (aria-expanded)
 *  - <Menu> opens and closes
 * "Lift state up to the closest common parent" — core React rule.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Hide on scroll down, show on scroll up. A ref (not state) keeps the last
  // position: changing it must NOT re-render the component.
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      setHidden(y > lastY.current && y > window.innerHeight * 0.8);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <header
        className={cx(
          styles.header,
          scrolled && styles.scrolled,
          hidden && !menuOpen && styles.hidden,
          menuOpen && styles.menuOpen,
        )}
      >
        <Link className={styles.brand} href="/" aria-label={`${site.name} — home`}>
          <b>{site.name}</b>
          <span className="mono">Web Engineer</span>
        </Link>

        <nav className={styles.nav} aria-label="Primary">
          {site.nav.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <AvailablePill>
            <span className={styles.long}>Available — start a call</span>
            <span className={styles.short}>Available</span>
          </AvailablePill>

          <button
            ref={buttonRef}
            type="button"
            className={styles.menuBtn}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className={styles.label} aria-hidden="true">
              <span>Menu</span>
              <span>Close</span>
            </span>
            <span className={styles.lines} aria-hidden="true">
              <i />
              <i />
            </span>
            <span className="sr-only">Menu</span>
          </button>
        </div>
      </header>

      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} returnFocusTo={buttonRef} />
    </>
  );
}
