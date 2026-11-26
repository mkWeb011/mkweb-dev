'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type MouseEvent, type RefObject } from 'react';
import { site } from '@/content/site';
import { gsap } from '@/lib/gsap';
import { useLocalTime } from '@/hooks/useLocalTime';
import { scrollToHash, useLenis } from '@/components/motion/SmoothScroll';
import styles from './Menu.module.css';

interface MenuProps {
  open: boolean;
  onClose: () => void;
  /** Where focus goes back when the menu closes (the menu button). */
  returnFocusTo: RefObject<HTMLButtonElement | null>;
}

/**
 * Fullscreen menu overlay.
 *
 * `open` is the *wish* (from the parent). `rendered` is the *reality*:
 * on close we keep the overlay in the DOM until the exit animation ends,
 * then unmount it. That is the classic "animate out before unmount" pattern.
 */
export function Menu({ open, onClose, returnFocusTo }: MenuProps) {
  const [rendered, setRendered] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const pendingHref = useRef<string | null>(null);
  const lenis = useLenis();
  const router = useRouter();
  const pathname = usePathname();
  const time = useLocalTime(site.timeZone);

  // Mount as soon as the parent asks to open.
  // (Unmounting happens in the exit animation below.)
  if (open && !rendered) setRendered(true);

  // Enter / exit animation + side effects (scroll lock, focus).
  useEffect(() => {
    const root = rootRef.current;
    if (!rendered || !root) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const labels = root.querySelectorAll('[data-menu-label]');
    const side = root.querySelectorAll('[data-menu-side]');

    if (open) {
      lenis?.stop();
      document.documentElement.style.overflow = 'hidden';
      root.querySelector<HTMLAnchorElement>('a')?.focus({ preventScroll: true });
      if (reduce) return;
      const tl = gsap
        .timeline()
        .fromTo(
          root,
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', duration: 0.9, ease: 'expo.inOut' },
        )
        .fromTo(labels, { yPercent: 110 }, { yPercent: 0, duration: 1.1, stagger: 0.05 }, 0.35)
        .fromTo(side, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.06 }, 0.6);
      return () => {
        tl.kill();
      };
    }

    // Closing: run the exit animation, THEN unmount and navigate.
    const finish = () => {
      document.documentElement.style.overflow = '';
      lenis?.start();
      setRendered(false);
      const href = pendingHref.current;
      pendingHref.current = null;
      if (href) navigate(href);
      else returnFocusTo.current?.focus({ preventScroll: true });
    };
    if (reduce) {
      finish();
      return;
    }
    const tl = gsap
      .timeline({ onComplete: finish })
      .to(labels, { yPercent: -110, duration: 0.5, stagger: 0.025, ease: 'power3.in' }, 0)
      .to(side, { opacity: 0, duration: 0.3 }, 0)
      .to(root, { clipPath: 'inset(100% 0 0 0)', duration: 0.8, ease: 'expo.inOut' }, 0.2);
    return () => {
      tl.kill();
    };
    // navigate is stable enough for this effect; listing it would restart animations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, rendered, lenis, returnFocusTo]);

  // Keyboard: Escape closes, Tab stays inside (focus trap).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !rootRef.current) return;
      const focusables = [returnFocusTo.current, ...rootRef.current.querySelectorAll<HTMLElement>('a[href]')].filter(
        (el): el is HTMLElement => el !== null,
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose, returnFocusTo]);

  function navigate(href: string) {
    const url = new URL(href, window.location.origin);
    if (url.pathname === pathname && url.hash) scrollToHash(url.hash, lenis);
    else router.push(href);
  }

  function onLinkClick(e: MouseEvent<HTMLAnchorElement>, href: string) {
    e.preventDefault();
    pendingHref.current = href; // navigate after the exit animation
    onClose();
  }

  if (!rendered) return null;

  return (
    <div
      ref={rootRef}
      id="site-menu"
      className={styles.menu}
      role="dialog"
      aria-modal="true"
      aria-label="Site menu"
      data-menu
      data-lenis-prevent
    >
      <div className={styles.inner}>
        <nav className={styles.nav} aria-label="Sections">
          <ol>
            {site.menu.map((item, i) => (
              <li key={item.href}>
                <a href={item.href} onClick={(e) => onLinkClick(e, item.href)}>
                  <span className={`${styles.num} mono`}>{String(i).padStart(2, '0')}</span>
                  <span className={styles.mask}>
                    <span className={styles.label} data-menu-label>
                      {item.label}
                      {item.label && 'accent' in item ? ' ' : ''}
                      {'accent' in item ? <em>{item.accent}</em> : null}
                    </span>
                  </span>
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <dl className={styles.side}>
          <div data-menu-side>
            <dt className="mono">Status</dt>
            <dd>
              <a href={site.meetUrl} target="_blank" rel="noopener noreferrer">
                <span className="dot" style={{ marginRight: 10 }} aria-hidden="true" />
                Available — start a call
              </a>
            </dd>
          </div>
          <div data-menu-side>
            <dt className="mono">Belgrade, local time</dt>
            <dd>
              {time} <span className="mono muted">CET</span>
            </dd>
          </div>
          <div data-menu-side>
            <dt className="mono">Currently</dt>
            <dd>{site.currently}</dd>
          </div>
          <div data-menu-side>
            <dt className="mono">Elsewhere</dt>
            <dd>
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <br />
              <a href={site.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn ↗
              </a>
            </dd>
          </div>
        </dl>

        <div className={`${styles.foot} mono`} data-menu-side>
          <span>
            {site.name} — {site.role}
          </span>
          <span>Esc to close</span>
        </div>
      </div>
    </div>
  );
}
