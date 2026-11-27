'use client';

/**
 * One place that imports GSAP and registers its plugins.
 * Every component imports gsap from HERE, never from 'gsap' directly,
 * so plugins are registered exactly once and tree-shaking stays predictable.
 * Since GSAP 3.13 all plugins (incl. SplitText) are free and ship in the npm package.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';

// registerPlugin must not run on the server (no window there).
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, SplitText, useGSAP);
  gsap.defaults({ ease: 'expo.out', duration: 1.2 });
}

export { gsap, ScrollTrigger, SplitText, useGSAP };

/** Shared media queries so every animation agrees on the same breakpoints. */
export const MQ = {
  motion: '(prefers-reduced-motion: no-preference)',
  desktopMotion: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
  mobileMotion: '(max-width: 899px) and (prefers-reduced-motion: no-preference)',
  finePointer: '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
} as const;
