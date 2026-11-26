'use client';

import { gsap, ScrollTrigger, SplitText, useGSAP, MQ } from '@/lib/gsap';

/**
 * The home page's "motion director".
 *
 * Sections are Server Components (plain HTML, no JS). This single client
 * component finds them by class / data attribute after hydration and adds
 * scroll animations. Benefits:
 *  - sections stay simple and fast,
 *  - all motion timing lives in one file (one easing language),
 *  - with JS disabled or reduced motion, everything is simply visible.
 *
 * It renders nothing. useGSAP reverts every tween, ScrollTrigger and
 * SplitText created here when the page unmounts.
 */
export function SiteMotion() {
  useGSAP(() => {
    const root = document.documentElement;
    const mm = gsap.matchMedia();

    mm.add(MQ.motion, () => {
      root.classList.add('has-motion');

      /* ---------- Hero intro ---------- */
      const name = document.querySelector('.hero-name');
      const tl = gsap.timeline({ delay: 0.15 });
      if (name) {
        const split = SplitText.create(name, { type: 'chars', mask: 'chars' });
        gsap.set(name, { visibility: 'visible' });
        tl.from(split.chars, { yPercent: 110, duration: 1.6, stagger: 0.035 }, 0);
      }
      tl.fromTo('.hero-role', { opacity: 0, y: 14 }, { opacity: 1, y: 0 }, 0.7)
        .fromTo('.hero-intro', { opacity: 0, y: 24 }, { opacity: 1, y: 0 }, 0.8)
        .fromTo('.hero-foot', { opacity: 0 }, { opacity: 1 }, 1.1);

      gsap.to('.hero-name', {
        yPercent: -18,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero-intro', {
        opacity: 0,
        y: -40,
        ease: 'none',
        immediateRender: false,
        scrollTrigger: { trigger: '.hero', start: '15% top', end: '60% top', scrub: true },
      });

      /* ---------- Statement: words light up with scroll ---------- */
      const statement = document.querySelector('#statement');
      if (statement) {
        const words = SplitText.create(statement, { type: 'words' }).words;
        gsap.fromTo(
          words,
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.08,
            ease: 'none',
            scrollTrigger: { trigger: statement, start: 'top 80%', end: 'bottom 45%', scrub: 0.6 },
          },
        );
      }

      /* ---------- Section heads: heading lines rise from a mask ---------- */
      gsap.utils.toArray<HTMLElement>('[data-reveal="head"]').forEach((head) => {
        const h2 = head.querySelector('h2');
        const t = gsap.timeline({ scrollTrigger: { trigger: head, start: 'top 85%' } });
        if (h2) {
          const lines = SplitText.create(h2, { type: 'lines', mask: 'lines' }).lines;
          t.from(lines, { yPercent: 100, stagger: 0.08, duration: 1.3 }, 0);
        }
        t.from(head.querySelectorAll('.idx, .aside'), { opacity: 0, duration: 1 }, 0.2);
      });

      /* ---------- Lists ---------- */
      gsap.from('.work-list .row', {
        y: 50,
        opacity: 0,
        stagger: 0.07,
        scrollTrigger: { trigger: '.work-list', start: 'top 80%' },
      });
      gsap.from('[data-reveal="arc"]', {
        y: 24,
        opacity: 0,
        stagger: 0.035,
        duration: 1,
        scrollTrigger: { trigger: '#archive', start: 'top 70%' },
      });

      /* ---------- About ---------- */
      const lead = document.querySelector('#about-lead');
      if (lead) {
        const lines = SplitText.create(lead, { type: 'lines', mask: 'lines' }).lines;
        gsap.from(lines, {
          yPercent: 100,
          stagger: 0.09,
          duration: 1.4,
          scrollTrigger: { trigger: lead, start: 'top 80%' },
        });
      }

      /* ---------- Portrait: mask reveal + slow zoom-out, then gentle parallax ---------- */
      const portrait = document.querySelector('[data-reveal="portrait"]');
      if (portrait) {
        const frame = portrait.querySelector('.portrait-frame');
        const img = portrait.querySelector('img');
        gsap.from(frame, {
          clipPath: 'inset(100% 0 0 0)',
          duration: 1.6,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: portrait, start: 'top 80%' },
        });
        gsap.from(img, { scale: 1.25, duration: 2.2, scrollTrigger: { trigger: portrait, start: 'top 80%' } });
        gsap.to(img, {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: { trigger: portrait, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }

      /* ---------- Experience timeline: line draws with scroll ---------- */
      gsap.to('[data-timeline-progress]', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: { trigger: '[data-timeline]', start: 'top 70%', end: 'bottom 70%', scrub: true },
      });
      gsap.utils.toArray<HTMLElement>('.job').forEach((job) => {
        gsap.from(job.querySelectorAll('.yrs, h3, .role, li, .job-kind'), {
          opacity: 0,
          y: 22,
          stagger: 0.04,
          duration: 1,
          scrollTrigger: { trigger: job, start: 'top 82%' },
        });
      });

      /* ---------- Lab card & contact ---------- */
      gsap.from('.lab-card', {
        clipPath: 'inset(0 0 100% 0)',
        duration: 1.6,
        ease: 'expo.inOut',
        scrollTrigger: { trigger: '.lab-card', start: 'top 85%' },
      });
      const contact = document.querySelector('#contact-h');
      if (contact) {
        const chars = SplitText.create(contact, { type: 'chars', mask: 'chars' }).chars;
        gsap.from(chars, {
          yPercent: 110,
          stagger: 0.03,
          duration: 1.5,
          scrollTrigger: { trigger: contact, start: 'top 85%' },
        });
      }

      /* ---------- Blog cards ---------- */
      gsap.utils.toArray<HTMLElement>('.post').forEach((post) => {
        gsap.from(post.querySelector('.post-vis'), {
          clipPath: 'inset(100% 0 0 0)',
          duration: 1.4,
          ease: 'expo.inOut',
          scrollTrigger: { trigger: post, start: 'top 88%' },
        });
      });

      return () => root.classList.remove('has-motion');
    });

    /* ---------- Capabilities: horizontal scroll, desktop only ---------- */
    mm.add(MQ.desktopMotion, () => {
      const track = document.querySelector<HTMLElement>('[data-caps-track]');
      const pin = document.querySelector<HTMLElement>('[data-caps-pin]');
      if (!track || !pin) return;
      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true, // recompute distance on resize
        },
      });
    });

    mm.add(MQ.mobileMotion, () => {
      gsap.from('.cap', {
        y: 40,
        opacity: 0,
        stagger: 0.1,
        scrollTrigger: { trigger: '[data-caps-track]', start: 'top 80%' },
      });
    });

    // Web fonts change text width → re-measure split lines and pin distances.
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    // Motion is set up (or skipped for reduced motion): lift the pre-paint guard
    // set by the inline script in app/layout.tsx.
    root.classList.remove('motion-pending');
  });

  return null;
}
