'use client';

import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';

/**
 * Lenis smooth scrolling, driven by GSAP's ticker.
 * One clock for both libraries = ScrollTrigger always knows the exact
 * scroll position (no jitter, no competing scroll systems).
 *
 * The Lenis instance is shared through React Context so that other
 * components (Menu, anchor links) can call lenis.stop() / scrollTo().
 */
const LenisContext = createContext<Lenis | null>(null);

/** Read the Lenis instance (null on the server or with reduced motion). */
export function useLenis(): Lenis | null {
  return useContext(LenisContext);
}

/** Scroll to "#id" (or top) with Lenis if available, natively otherwise. */
export function scrollToHash(hash: string, lenis: Lenis | null): void {
  if (hash === '#top' || hash === '#') {
    if (lenis) lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }
  const el = document.querySelector<HTMLElement>(hash);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const pathname = usePathname();

  // 1) Create Lenis once (unless the visitor prefers reduced motion).
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const instance = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    instance.on('scroll', ScrollTrigger.update);
    const raf = (time: number) => instance.raf(time * 1000); // gsap gives seconds
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(raf);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // 2) Same-page anchor links ("/#work" while on "/") → smooth scroll.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.('a[href*="#"]');
      if (!(a instanceof HTMLAnchorElement)) return;
      if (a.closest('[data-menu]')) return; // the menu handles its own links
      const url = new URL(a.href);
      if (url.pathname !== window.location.pathname || !url.hash) return;
      e.preventDefault();
      scrollToHash(url.hash, lenis);
      history.replaceState(null, '', url.hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [lenis]);

  // 3) After client-side navigation, start at the top (or at the hash).
  useEffect(() => {
    const { hash } = window.location;
    if (hash) requestAnimationFrame(() => scrollToHash(hash, lenis));
    else lenis?.scrollTo(0, { immediate: true });
    ScrollTrigger.refresh();
  }, [pathname, lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
