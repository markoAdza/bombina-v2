/**
 * UI behaviour that must work with or without motion:
 * nav states, mobile menu, map facade, review toggles, frog easter egg,
 * menu-page tab highlighting and layout safety checks.
 */

const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

export const emit = (name: 'bombina:lock' | 'bombina:unlock') => document.dispatchEvent(new CustomEvent(name));

function nav() {
  const navEl = $('[data-nav]');
  const sentinel = $('[data-nav-sentinel]');
  if (!navEl || !sentinel) return;

  let stuck = false;
  new IntersectionObserver(([entry]) => {
    stuck = !entry.isIntersecting && entry.boundingClientRect.top < 0;
    navEl.classList.toggle('is-stuck', stuck);
    if (!stuck) navEl.classList.remove('is-compact');
  }).observe(sentinel);

  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;
        if (stuck && Math.abs(delta) > 6) navEl.classList.toggle('is-compact', delta > 0);
        // slide the nav away once the reveal footer is mostly uncovered
        const footer = document.querySelector<HTMLElement>('[data-footer]');
        const maxY = document.documentElement.scrollHeight - window.innerHeight;
        const away = !!footer && !footer.classList.contains('is-static') && y > maxY - footer.offsetHeight * 0.5;
        navEl.classList.toggle('is-away', away);
        lastY = y;
        ticking = false;
      });
    },
    { passive: true },
  );
}

function mobileMenu() {
  const menu = $('[data-mobile-menu]');
  const openBtn = $<HTMLButtonElement>('[data-menu-open]');
  const closeBtn = $<HTMLButtonElement>('[data-menu-close]');
  if (!menu || !openBtn || !closeBtn) return;

  const focusables = () => $$<HTMLElement>('a[href], button:not([disabled])', menu);

  const open = () => {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add('is-open'));
    openBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    emit('bombina:lock');
    closeBtn.focus();
  };

  const close = (returnFocus = true) => {
    menu.classList.remove('is-open');
    openBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    emit('bombina:unlock');
    window.setTimeout(() => (menu.hidden = true), 350);
    if (returnFocus) openBtn.focus();
  };

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', () => close());
  $$('[data-menu-link]', menu).forEach((a) => a.addEventListener('click', () => close(false)));

  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key !== 'Tab') return;
    const items = focusables();
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.matchMedia('(min-width: 1025px)').addEventListener('change', (e) => {
    if (e.matches && !menu.hidden) close(false);
  });
}

function mapFacade() {
  $$('[data-map]').forEach((map) => {
    const btn = $<HTMLButtonElement>('[data-map-load]', map);
    btn?.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = map.dataset.src ?? '';
      iframe.title = map.dataset.title ?? 'Map';
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      map.appendChild(iframe);
      map.classList.add('is-loaded');
      iframe.focus();
    });
  });
}

function reviews() {
  $$<HTMLButtonElement>('[data-review-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.review');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      btn.textContent = expanded ? btn.dataset.more ?? '' : btn.dataset.less ?? '';
      card?.classList.toggle('is-expanded', !expanded);
      document.dispatchEvent(new CustomEvent('bombina:layout'));
    });
  });
}

function frog() {
  const btn = $<HTMLButtonElement>('[data-frog]');
  const live = $('[data-frog-live]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    btn.classList.remove('is-waving');
    void btn.offsetWidth; // restart the bow animation
    btn.classList.add('is-waving');
    if (live) {
      live.textContent = '';
      window.setTimeout(() => (live.textContent = live.dataset.text ?? ''), 50);
    }
    window.setTimeout(() => btn.classList.remove('is-waving'), 2600);
  });
}

/** Highlight the current section in the menu page's sticky tabs. */
function menuTabs() {
  const tabs = $$<HTMLAnchorElement>('[data-menu-tab]');
  if (!tabs.length) return;
  const byId = new Map(tabs.map((t) => [t.hash.slice(1), t]));
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        tabs.forEach((t) => t.removeAttribute('aria-current'));
        byId.get(entry.target.id)?.setAttribute('aria-current', 'true');
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) io.observe(section);
  });
}

/**
 * Layout safety: a sticky element taller than the viewport would hide content
 * (stacked cards, reveal footer). Fall back to normal flow when that happens.
 */
function layoutGuards() {
  const footer = $('[data-footer]');
  const cards = $$('[data-stack-card]');
  const navH = () => $('[data-nav]')?.getBoundingClientRect().height ?? 0;

  const check = () => {
    const vh = window.innerHeight;
    if (footer) footer.classList.toggle('is-static', footer.offsetHeight > vh - 24);
    // all-or-nothing: a half-sticky stack looks broken
    cards.forEach((card) => card.classList.remove('is-unstuck'));
    const tooTall = cards.some((card) => {
      const stickyTop = parseFloat(getComputedStyle(card).top) || navH();
      return card.offsetHeight > vh - stickyTop - 8;
    });
    cards.forEach((card) => card.classList.toggle('is-unstuck', tooTall));
    document.dispatchEvent(new CustomEvent('bombina:layout'));
  };

  // The reveal footer sits *behind* the page until you reach the end. Keyboard users tabbing into it
  // would focus links that are still covered, so reveal it by scrolling to the bottom.
  footer?.addEventListener('focusin', () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (window.scrollY < max - 4) window.scrollTo({ top: max, behavior: 'auto' });
  });

  check();
  let raf = 0;
  const schedule = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(check);
  };
  window.addEventListener('resize', schedule);
  document.fonts?.ready.then(schedule);
}

/** Hide the sticky hero once the content curtain fully covers it (no painting, no peeking corners). */
function curtain() {
  const hero = $('[data-hero]');
  const sentinel = $('[data-curtain-sentinel]');
  if (!hero || !sentinel) return;
  new IntersectionObserver(([entry]) => {
    hero.classList.toggle('is-covered', !entry.isIntersecting && entry.boundingClientRect.top < 0);
  }).observe(sentinel);
}

export function initUi() {
  curtain();
  nav();
  mobileMenu();
  mapFacade();
  reviews();
  frog();
  menuTabs();
  layoutGuards();
}
