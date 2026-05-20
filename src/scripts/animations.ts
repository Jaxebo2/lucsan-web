/**
 * Animations — Lenis smooth scroll + GSAP scroll-driven reveals.
 *
 * Loaded as a client-side script from BaseLayout. Re-runs on every
 * Astro View Transitions navigation via `astro:page-load`.
 *
 * Respects `prefers-reduced-motion: reduce` — bails out immediately.
 */

import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;
let rafId: number | null = null;

function initLenis(): void {
  if (lenis) return; // already running
  lenis = new Lenis({
    duration: 1.0,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
  });

  const raf = (time: number) => {
    lenis?.raf(time);
    rafId = requestAnimationFrame(raf);
  };
  rafId = requestAnimationFrame(raf);

  // Sync Lenis with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => {
    lenis?.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

function destroyLenis(): void {
  if (rafId !== null) cancelAnimationFrame(rafId);
  rafId = null;
  lenis?.destroy();
  lenis = null;
}

function initReveals(): void {
  // Auto-reveal any element with [data-reveal] when it enters viewport.
  // toggleActions: play (enter down) reverse (leave up) play (enter up) reverse (leave down)
  // Esto hace que SIEMPRE se anime entrada/salida en ambas direcciones de scroll.
  const targets = document.querySelectorAll<HTMLElement>('[data-reveal]');
  targets.forEach((el) => {
    const delay = parseFloat(el.dataset.revealDelay ?? '0');
    gsap.fromTo(
      el,
      { opacity: 0, y: 32 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        delay,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          end: 'bottom 12%',
          toggleActions: 'play reverse play reverse',
        },
      },
    );
  });

  // Auto-stagger grid children when wrapper has [data-reveal-stagger]
  const staggerWrappers = document.querySelectorAll<HTMLElement>('[data-reveal-stagger]');
  staggerWrappers.forEach((wrapper) => {
    const children = Array.from(wrapper.children) as HTMLElement[];
    if (children.length === 0) return;
    gsap.fromTo(
      children,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: {
          trigger: wrapper,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse',
        },
      },
    );
  });

  // Block-level animation: cualquier <section> sin data-reveal-skip recibe
  // un fade+slide sutil al entrar/salir del viewport.
  const sections = document.querySelectorAll<HTMLElement>('section:not([data-reveal-skip])');
  sections.forEach((sec) => {
    // Saltar si ya tiene [data-reveal] o si es el hero (data-theme inverse en posición top 0)
    if (sec.dataset.reveal !== undefined) return;
    const isHero = sec.getBoundingClientRect().top < 100 && sec.dataset.theme === 'dark';
    if (isHero) return;

    gsap.fromTo(
      sec,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: sec,
          start: 'top 92%',
          end: 'bottom 8%',
          toggleActions: 'play reverse play reverse',
        },
      },
    );
  });

  // Hero entrance — fades in immediately on load (no scroll trigger)
  const hero = document.querySelector<HTMLElement>('[data-hero-reveal]');
  if (hero) {
    const items = hero.querySelectorAll<HTMLElement>('[data-hero-item]');
    if (items.length > 0) {
      gsap.fromTo(
        items,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
        },
      );
    }
  }
}

function teardownScrollTriggers(): void {
  ScrollTrigger.getAll().forEach((t) => t.kill());
}

function setup(): void {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return; // user opted out — skip all motion
  }
  initLenis();
  initReveals();
  ScrollTrigger.refresh();
}

function teardown(): void {
  teardownScrollTriggers();
  destroyLenis();
}

// Initial mount
document.addEventListener('astro:page-load', setup);
document.addEventListener('astro:before-swap', teardown);

// Fallback for initial load (in case astro:page-load already fired)
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setup();
} else {
  document.addEventListener('DOMContentLoaded', setup);
}
