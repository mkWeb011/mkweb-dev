'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap';

/** Path for a layered sine wave at time `t`. Exported for unit tests. */
export function wavePath(t = 0, width = 1200, step = 12): string {
  let d = '';
  for (let x = 0; x <= width; x += step) {
    const y = 150 + Math.sin(x * 0.012 + t) * 38 * Math.sin(x * 0.003 + t * 0.3) + Math.sin(x * 0.041 + t * 1.7) * 9;
    d += `${x ? 'L' : 'M'}${x} ${y.toFixed(1)}`;
  }
  return d;
}

/**
 * Animated "signal" line for the BalkanSignal card.
 * We write the `d` attribute directly via a ref on every tick instead of
 * using React state — 60 re-renders per second would be wasteful.
 */
export function SignalWave() {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    if (!path || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let t = 0;
    let onScreen = false;
    const io = new IntersectionObserver(([e]) => (onScreen = e?.isIntersecting ?? false));
    io.observe(path);
    const tick = (_time: number, deltaMs: number) => {
      if (!onScreen) return;
      t += deltaMs * 0.0006;
      path.setAttribute('d', wavePath(t));
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, []);

  return (
    <svg className="sig-wave" viewBox="0 0 1200 300" preserveAspectRatio="none" aria-hidden="true">
      <path ref={pathRef} d={wavePath()} fill="none" stroke="rgba(236,235,230,.35)" strokeWidth="1" />
    </svg>
  );
}
