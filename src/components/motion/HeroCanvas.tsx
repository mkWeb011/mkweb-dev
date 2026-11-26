'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { fragmentShader, vertexShader } from './heroShaders';

/**
 * Three.js "signal field": a breathing sphere of points behind the hero.
 *
 * React's job here is small: give Three.js a DOM node (useRef), start it
 * after mount (useEffect) and clean EVERYTHING up on unmount. Three.js itself
 * is imperative — React does not re-render it.
 */
export function HeroCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let disposed = false;
    let cleanup = () => {};

    // Dynamic import: three.js (~600 KB) loads AFTER the page is interactive
    // and only in browsers — it never blocks the first paint.
    import('three')
      .then((THREE) => {
        if (disposed) return;
        const probe = document.createElement('canvas');
        if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) return;

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const mobile = window.innerWidth < 860;

        const renderer = new THREE.WebGLRenderer({
          antialias: false,
          alpha: true,
          powerPreference: 'high-performance',
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
        host.appendChild(renderer.domElement);

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.z = 6.2;

        // Fibonacci sphere: evenly spread points on a unit sphere.
        const COUNT = mobile ? 5000 : 12000;
        const positions = new Float32Array(COUNT * 3);
        const random = new Float32Array(COUNT);
        const golden = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < COUNT; i++) {
          const y = 1 - (i / (COUNT - 1)) * 2;
          const r = Math.sqrt(1 - y * y);
          const theta = golden * i;
          positions[i * 3] = Math.cos(theta) * r;
          positions[i * 3 + 1] = y;
          positions[i * 3 + 2] = Math.sin(theta) * r;
          random[i] = Math.random();
        }
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('aRnd', new THREE.BufferAttribute(random, 1));

        const uniforms = {
          uTime: { value: 0 },
          uScroll: { value: 0 },
          uIntro: { value: reduce ? 1 : 0 },
          uMouse: { value: new THREE.Vector2() },
          uSize: { value: (mobile ? 2.2 : 2.6) * renderer.getPixelRatio() },
          uColor: { value: new THREE.Color('#ECEBE6') },
          uColorB: { value: new THREE.Color('#2F7BFF') }, // Webflow-like blue for depth
        };
        const material = new THREE.ShaderMaterial({
          uniforms,
          vertexShader,
          fragmentShader,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const group = new THREE.Group();
        group.add(new THREE.Points(geometry, material));
        scene.add(group);

        const layout = () => {
          const { clientWidth: w, clientHeight: h } = host;
          renderer.setSize(w, h, false);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          const small = w < 860;
          group.position.set(small ? 0.2 : 1.55, small ? 0.55 : 0.25, 0);
          group.scale.setScalar(small ? 0.95 : 1.25);
        };
        layout();
        const resizeObserver = new ResizeObserver(layout);
        resizeObserver.observe(host);

        const mouse = new THREE.Vector2();
        const mouseTarget = new THREE.Vector2();
        const onPointer = (e: PointerEvent) =>
          mouseTarget.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
        window.addEventListener('pointermove', onPointer, { passive: true });

        // Render only while the hero is on screen — saves battery.
        let visible = true;
        const io = new IntersectionObserver(([entry]) => (visible = entry?.isIntersecting ?? false));
        io.observe(host);

        const tweens: gsap.core.Tween[] = [];
        if (!reduce) {
          tweens.push(gsap.to(uniforms.uIntro, { value: 1, duration: 2.4, delay: 0.2 }));
          tweens.push(
            gsap.to(uniforms.uScroll, {
              value: 1,
              ease: 'none',
              scrollTrigger: { trigger: host.parentElement, start: 'top top', end: 'bottom top', scrub: true },
            }),
          );
        }

        const clock = new THREE.Clock();
        let frame = 0;
        const render = () => {
          const dt = Math.min(clock.getDelta(), 0.05);
          if (visible) {
            uniforms.uTime.value += dt;
            mouse.lerp(mouseTarget, 0.05);
            uniforms.uMouse.value.copy(mouse);
            group.rotation.y += dt * 0.06;
            group.rotation.x = mouse.y * 0.18;
            group.rotation.z = -mouse.x * 0.06;
            renderer.render(scene, camera);
          }
          frame = requestAnimationFrame(render);
        };
        if (reduce) {
          uniforms.uTime.value = 4;
          renderer.render(scene, camera); // one static frame
        } else {
          frame = requestAnimationFrame(render);
        }

        cleanup = () => {
          cancelAnimationFrame(frame);
          tweens.forEach((t) => {
            t.scrollTrigger?.kill();
            t.kill();
          });
          window.removeEventListener('pointermove', onPointer);
          resizeObserver.disconnect();
          io.disconnect();
          geometry.dispose();
          material.dispose();
          renderer.dispose();
          renderer.domElement.remove();
          ScrollTrigger.refresh();
        };
      })
      .catch((error: unknown) => {
        // A dynamic import is a network request — it can fail (offline, blocked
        // CDN, deploy in progress). The hero still works without the canvas.
        console.warn('[hero] three.js could not load:', error);
      });

    return () => {
      disposed = true; // the import may still be pending
      cleanup();
    };
  }, []);

  return <div id="gl" ref={hostRef} aria-hidden="true" />;
}
