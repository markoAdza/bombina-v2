/**
 * L2 "Flowing" motion (DESIGN.md §7). Loaded only when prefers-reduced-motion is off.
 * GSAP (+ ScrollTrigger, SplitText) and Lenis. Only transform / opacity / clip-path are animated.
 */
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';

declare global {
  interface Window {
    __bombinaMotion?: boolean;
  }
}

const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const isSmall = () => window.matchMedia('(max-width: 600px)').matches;

function smoothScroll() {
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  document.addEventListener('bombina:lock', () => lenis.stop());
  document.addEventListener('bombina:unlock', () => lenis.start());

  // same-page anchors glide (and respect the sticky nav)
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href*="#"]');
    if (!a || a.classList.contains('skip-link') || e.metaKey || e.ctrlKey) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!target) return;
    e.preventDefault();
    const navH = document.querySelector('[data-nav]')?.getBoundingClientRect().height ?? 0;
    lenis.scrollTo(target, { offset: -navH - 12, duration: 1.4 });
    history.pushState(null, '', url.hash);
  });
  return lenis;
}

function hero() {
  const el = document.querySelector<HTMLElement>('[data-hero]');
  if (!el) return;
  const wordmark = el.querySelector('.hero__wordmark');
  gsap
    .timeline({ defaults: { ease: 'expo.out' } })
    .to(el.querySelectorAll('.hero__media img'), { scale: 1, duration: 2.4 }, 0)
    .fromTo(wordmark, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6 }, 0.25)
    .to(el.querySelectorAll('[data-hero-fade]'), { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.65);

  const scrollRange = { trigger: el, start: 'top top', end: 'bottom top', scrub: true };
  gsap.to(el.querySelector('[data-hero-parallax]'), { yPercent: -22, ease: 'none', scrollTrigger: scrollRange });
  gsap.to(el.querySelector('[data-hero-media]'), { scale: 1.08, ease: 'none', scrollTrigger: { ...scrollRange } });
}

function splits() {
  $$('[data-split="words"]').forEach((el) => {
    SplitText.create(el, {
      type: 'lines,words',
      mask: 'lines',
      autoSplit: true,
      onSplit(self) {
        el.classList.add('is-split');
        return gsap.from(self.words, {
          yPercent: 115,
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.045,
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      },
    });
  });

  $$('[data-split="chars"]').forEach((el) => {
    SplitText.create(el, {
      type: 'words,chars',
      autoSplit: true,
      onSplit(self) {
        el.classList.add('is-split');
        return gsap.from(self.chars, {
          yPercent: 90,
          rotate: 6,
          opacity: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.016,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      },
    });
  });
}

function reveals() {
  const items = $$('[data-reveal]');
  if (!items.length) return;
  gsap.set(items, { opacity: 0, y: 28 });
  ScrollTrigger.batch(items, {
    start: 'top 90%',
    once: true,
    onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: 0.95, ease: 'power3.out', stagger: 0.08, overwrite: true }),
  });
}

function draws() {
  $$<SVGPathElement>('[data-draw]').forEach((path, i) => {
    const len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(path, {
      strokeDashoffset: 0,
      duration: i % 2 ? 0.5 : 1.3,
      delay: i % 2 ? 1.6 : 0.5,
      ease: 'power2.inOut',
      scrollTrigger: { trigger: path.ownerSVGElement ?? path, start: 'top 85%', once: true },
    });
  });
}

function parallax() {
  $$('[data-parallax]').forEach((el) => {
    const amount = parseFloat(el.dataset.parallax ?? '0') * (isSmall() ? 0.5 : 1);
    gsap.fromTo(
      el,
      { yPercent: amount },
      { yPercent: -amount, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } },
    );
  });
}

/** Sticky card stack: the previous card recedes (scale + dim) as the next one arrives. */
function stack() {
  const cards = $$('[data-stack-card]');
  cards.forEach((card, i) => {
    const img = card.querySelector('[data-card-img]');
    if (img) {
      gsap.fromTo(img, { yPercent: 6 }, { yPercent: -3, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'top 25%', scrub: true } });
    }
    const next = cards[i + 1];
    if (!next) return;
    const stacking = () => !card.classList.contains('is-unstuck') && !next.classList.contains('is-unstuck');
    gsap.to(card, {
      scale: () => (stacking() ? 0.94 : 1),
      '--dim': () => (stacking() ? 0.2 : 0),
      ease: 'none',
      scrollTrigger: {
        trigger: next,
        start: 'top bottom',
        end: () => `top ${parseFloat(getComputedStyle(next).top) || 0}px`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });
  });
}

/** Text marquee whose speed + direction follow the scroll. */
function marquee() {
  $$('[data-marquee]').forEach((mq) => {
    const track = mq.querySelector('[data-marquee-track]');
    if (!track) return;
    mq.classList.add('is-driven');
    const tween = gsap.to(track, { xPercent: -50, duration: 42, ease: 'none', repeat: -1 });
    tween.totalTime(tween.duration() * 200); // room to run "backwards" when scrolling up
    let speed: gsap.core.Timeline | null = null;
    ScrollTrigger.create({
      trigger: mq,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => tween.paused(!self.isActive),
      onUpdate(self) {
        const direction = self.direction;
        const boost = Math.min(Math.abs(self.getVelocity()) / 350, 5);
        speed?.kill();
        speed = gsap
          .timeline()
          .to(tween, { timeScale: direction * (1 + boost), duration: 0.2, ease: 'power1.out' })
          .to(tween, { timeScale: direction, duration: 1.2, ease: 'power2.out' });
      },
    });
  });
}

/** Instagram collage: depth parallax + gentle mouse drift. */
function instagram() {
  const stage = document.querySelector<HTMLElement>('[data-ig-stage]');
  if (!stage) return;
  const tiles = $$<HTMLElement>('[data-ig-tile]', stage);
  const amp = isSmall() ? 0.45 : 1;

  gsap.from(tiles, {
    scale: 0.82,
    opacity: 0,
    duration: 1.3,
    ease: 'expo.out',
    stagger: { each: 0.07, from: 'center' },
    scrollTrigger: { trigger: stage, start: 'top 75%', once: true },
  });

  tiles.forEach((tile) => {
    const depth = Number(tile.dataset.depth ?? 2);
    const y = (4 - depth) * 9 * amp;
    gsap.fromTo(tile, { yPercent: y }, { yPercent: -y, ease: 'none', scrollTrigger: { trigger: stage, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
  });

  if (!canHover) return;
  let raf = 0;
  let mx = 0;
  let my = 0;
  stage.addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect();
    mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    if (raf) return;
    raf = requestAnimationFrame(() => {
      stage.style.setProperty('--mx', mx.toFixed(3));
      stage.style.setProperty('--my', my.toFixed(3));
      raf = 0;
    });
  });
  stage.addEventListener('pointerleave', () => {
    stage.style.setProperty('--mx', '0');
    stage.style.setProperty('--my', '0');
  });
}

/** Magnetic CTAs (fine pointers only). */
function magnetic() {
  if (!canHover) return;
  $$('.magnetic').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo(((e.clientX - r.left) / r.width - 0.5) * 18);
      yTo(((e.clientY - r.top) / r.height - 0.5) * 12);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

export function initMotion() {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  window.__bombinaMotion = true;

  smoothScroll();
  hero();
  reveals();
  draws();
  parallax();
  stack();
  marquee();
  instagram();
  magnetic();

  // split headlines once the real fonts are in (correct line breaks)
  (document.fonts?.ready ?? Promise.resolve()).then(() => {
    splits();
    ScrollTrigger.refresh();
  });

  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.addEventListener('bombina:layout', () => ScrollTrigger.refresh());
}
