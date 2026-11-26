'use client';

import { useRef, type ReactNode } from 'react';
import { gsap, useGSAP, MQ } from '@/lib/gsap';

/**
 * Wraps any element and makes it gently follow the cursor ("magnetic").
 * Only on devices with a precise pointer and without reduced motion.
 * `display: contents` would break transforms, so we use inline-block.
 */
export function Magnetic({ children, strength = 0.3 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MQ.finePointer, () => {
        const el = ref.current;
        if (!el) return;
        const x = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        const y = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'elastic.out(1, 0.5)' });
        const move = (e: PointerEvent) => {
          const r = el.getBoundingClientRect();
          x((e.clientX - (r.left + r.width / 2)) * strength);
          y((e.clientY - (r.top + r.height / 2)) * strength * 1.3);
        };
        const leave = () => {
          x(0);
          y(0);
        };
        el.addEventListener('pointermove', move);
        el.addEventListener('pointerleave', leave);
        return () => {
          el.removeEventListener('pointermove', move);
          el.removeEventListener('pointerleave', leave);
        };
      });
    },
    { scope: ref },
  );

  return (
    <span ref={ref} style={{ display: 'inline-block' }}>
      {children}
    </span>
  );
}
