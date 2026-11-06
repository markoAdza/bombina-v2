# DESIGN.md — Bistro Bombina

> **Linen tablecloth, candlelight, a frog in a bow tie.** Fancy enough for a celebration, homey enough to come in without taking your shoes off ("Kr naprej, pa neč se sezuvat!").

Reference: [yauya.si](https://yauya.si/), used for its sticky photo hero with a full-width wordmark, sticky stacked cards, Instagram parallax collage and reveal footer. Bombina takes those structures and improves on them (see §10).

---

## 1. Visual Theme & Atmosphere

**Style**: Warm Editorial Bistro (Cream Editorial base + Organic Natural accent)
**Keywords**: linen, candlelit, hand-drawn, seasonal, unhurried, generous whitespace, editorial serif, a touch of wit
**Tone**: refined, warm, personal, and a little playful (the frog), NOT corporate, NOT "luxury black & gold", NOT rustic-kitsch
**Feel**: a menu printed on heavy cream paper with a handwritten note from the chef tucked inside.

**Interaction Tier**: **L2: Flowing.** Sticky "curtain" hero, receding stacked cards, depth-parallax collage, scroll reveals, smooth scroll, and a nav that reacts to scroll.
**Dependencies**: `gsap` (+ `ScrollTrigger`, `SplitText`, both free since GSAP 3.13) · `lenis` · Fontsource (self-hosted fonts)

**Brand assets**
- **Wordmark**: the restaurant's brush lettering "BOMBINA / BISTRO", vectorized to `src/assets/brand/wordmark-*.svg` with `fill="currentColor"`. It is the hero H1 and the footer display.
- **Mascot**: the frog waiter (150×150 raster, made transparent). Used only small: nav emblem (≤56px), favicon, and the footer easter egg.
- **Photography**: warm wood tables, vintage porcelain, golden side-light. Always full colour and never filtered.

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds */
  --bg: #F7F2EA;            /* linen: page background */
  --surface: #FFFDF9;       /* cards, menu sheets */
  --surface-alt: #EFE7DA;   /* sand: alternating sections */
  --surface-hover: #F2EBDF; /* hovered surfaces */
  --beige: #E4D6C1;         /* image placeholders, dividers on sand */

  /* Borders */
  --line: #D8CCBA;          /* hairlines */
  --line-strong: #A8906C;   /* caramel borders (cards, chips on hover) */

  /* Text */
  --ink: #1E1A15;           /* headings (15.5:1 on --bg) */
  --ink-soft: #4A433A;      /* body (8.7:1) */
  --ink-muted: #6F665A;     /* labels, meta (5.1:1 on --bg, 4.6:1 on --surface-alt) */
  --on-dark: #F7F2EA;       /* text on ink / caramel-deep / photos */

  /* Accent: sage pistachio (frog nod) */
  --sage: #B7C3A0;          /* pastel fills: nav strip, tags, blobs */
  --sage-soft: #DDE3D1;     /* tinted cards, chips */
  --sage-deep: #5F6E4A;     /* text-safe accent: links, focus ring (4.9:1 on --bg) */
  --accent: var(--sage-deep);
  --accent-hover: var(--ink);

  /* Warm neutrals */
  --caramel: #A8906C;       /* decorative only (≤3:1 → never body text) */
  --caramel-deep: #7A6347;  /* footer background (cream text 5.1:1) */

  /* RGB helpers for rgba() */
  --bg-rgb: 247, 242, 234;
  --surface-rgb: 255, 253, 249;
  --ink-rgb: 30, 26, 21;
  --sage-rgb: 183, 195, 160;
  --sage-deep-rgb: 95, 110, 74;
  --caramel-rgb: 168, 144, 108;
  --caramel-deep-rgb: 122, 99, 71;

  /* Semantic */
  --success: #5F6E4A;
  --error: #A2462F;
  --warning: #B8862F;
}
```

**Color Rules**
- Every colour is referenced through these variables. **Zero hex values outside `tokens.css`.**
- Sage is the only accent. Pastel `--sage`/`--sage-soft` are **fills**; only `--sage-deep` may carry text, and only on `--bg` or `--surface`.
- `--caramel` is decorative (borders, rules, illustrations). Text on caramel tones must use `--caramel-deep` as the background with `--on-dark`.
- Photos carry the saturated colour. UI chrome stays in linen, sand, ink and sage.
- Scrims on photos use `rgba(var(--ink-rgb), …)` gradients only, never pure black.

## 3. Typography Rules

**Font Stack** (self-hosted via Fontsource for GDPR; the Google Fonts URL below is the equivalent reference):
```css
/* Reference only: we bundle @fontsource-variable/fraunces (opsz + opsz-italic builds), @fontsource-variable/dm-sans (wght), @fontsource-variable/caveat (wght) */
@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400..700&family=DM+Sans:ital,opsz,wght@0,9..40,300..700;1,9..40,300..700&family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..700&display=swap');

:root {
  --font-display: 'Fraunces Variable', 'Fraunces', 'Iowan Old Style', 'Palatino Linotype', Georgia, serif;
  --font-body: 'DM Sans Variable', 'DM Sans', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif;
  --font-hand: 'Caveat Variable', 'Caveat', 'Segoe Print', 'Bradley Hand', cursive;
}
```
All three families include Latin Extended (č, š, ž, ë).

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Hero H1 | Brush wordmark (SVG) | 100% of viewport width minus gutters | — | — | — |
| Statement (display) | Fraunces (optical sizing auto) | `clamp(2.5rem, 1.2rem + 5.2vw, 5.75rem)` | 360 | 1.02 | -0.02em |
| Section H2 | Fraunces (optical sizing auto) | `clamp(2.25rem, 1.4rem + 3.6vw, 4.25rem)` | 380 | 1.04 | -0.015em |
| Card H3 | Fraunces (optical sizing auto) | `clamp(2rem, 1.3rem + 2.4vw, 3.25rem)` | 400 | 1.05 | -0.01em |
| H4 (menu item) | Fraunces (optical sizing auto) | 1.25rem | 500 | 1.25 | 0 |
| Lead | DM Sans | `clamp(1.125rem, 1rem + .4vw, 1.3125rem)` | 400 | 1.55 | 0 |
| Body | DM Sans | 1.0625rem (17px) | 400 | 1.65 | 0 |
| Label / eyebrow | DM Sans | 0.75rem | 600 | 1.2 | 0.16em, uppercase |
| Button | DM Sans | 0.8125rem | 600 | 1 | 0.12em, uppercase |
| Hand note | Caveat | `clamp(1.5rem, 1.2rem + 1vw, 2.125rem)` | 500 | 1.1 | 0 |
| Price | DM Sans, tabular-nums | 1rem | 600 | 1.2 | 0 |

**Typography Rules**
- Fraunces italic (`<em>`) marks **one** accent phrase per headline, e.g. "Dobra hrana, dobra pijača in *dobra družba*."
- Display serif stays light (360–420). The visual "weight" of the hero comes from the brush wordmark, so serif headlines never go bold (≥600).
- Caveat is used at most once per section, for short notes of ≤6 words, always in `--sage-deep` or `--on-dark`.
- Body copy max width is 62ch. Labels are always uppercase and tracked.
- **NEVER use**: Inter, Roboto, Arial as primary, Montserrat, Playfair Display, Lobster or other script display faces, or any second serif.

**Text Decoration** (per text-decoration-rules):
- Hero H1 (wordmark): no gradient and no shadow. On the photo it sits on an ink gradient scrim for legibility.
- Statement and H2: no gradient and no shadow (editorial restraint). Accent through italic only.
- H3 on cards: none.
- Text over photos (hero meta, buttons on images): `text-shadow: 0 1px 12px rgba(var(--ink-rgb), .35)` only where there is no scrim.

## 4. Component Stylings

### Buttons (text-swap hover, inspired by yauya's dual-label button)
```css
.btn {
  --btn-bg: var(--ink); --btn-fg: var(--on-dark); --btn-bd: var(--ink);
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
  min-height: 48px; padding: 0 1.6rem; border-radius: 999px;
  background: var(--btn-bg); color: var(--btn-fg); border: 1px solid var(--btn-bd);
  font: 600 .8125rem/1 var(--font-body); letter-spacing: .12em; text-transform: uppercase; text-decoration: none;
  overflow: hidden; cursor: pointer; isolation: isolate;
  transition: background-color .35s var(--ease-out), color .35s var(--ease-out), border-color .35s var(--ease-out), transform .2s var(--ease-out);
}
.btn__label { position: relative; display: inline-grid; overflow: hidden; height: 1.1em; line-height: 1.1em; }
.btn__label > span { grid-area: 1 / 1; transition: transform .5s var(--ease-out); }
.btn__label > span + span { transform: translateY(105%); }
.btn:hover .btn__label > span:first-child,
.btn:focus-visible .btn__label > span:first-child { transform: translateY(-105%); }
.btn:hover .btn__label > span + span,
.btn:focus-visible .btn__label > span + span { transform: translateY(0); }
.btn:hover { --btn-bg: var(--sage-deep); --btn-bd: var(--sage-deep); }
.btn:active { transform: scale(.97); }
.btn:focus-visible { outline: 2px solid var(--sage-deep); outline-offset: 3px; }
.btn[disabled], .btn[aria-disabled="true"] { opacity: .45; cursor: not-allowed; pointer-events: none; }

.btn--ghost { --btn-bg: transparent; --btn-fg: var(--ink); --btn-bd: var(--ink); }
.btn--ghost:hover { --btn-bg: var(--ink); --btn-fg: var(--on-dark); --btn-bd: var(--ink); }
.btn--light { --btn-bg: var(--bg); --btn-fg: var(--ink); --btn-bd: var(--bg); }
.btn--light:hover { --btn-bg: var(--sage); --btn-fg: var(--ink); --btn-bd: var(--sage); }
.btn--sage { --btn-bg: var(--sage); --btn-fg: var(--ink); --btn-bd: var(--sage); }
.btn--sage:hover { --btn-bg: var(--ink); --btn-fg: var(--on-dark); --btn-bd: var(--ink); }
.btn--sm { min-height: 44px; padding: 0 1.15rem; }
```

### Stacked Cards
```css
.stack { display: grid; gap: 4vh; padding-block: 2rem 12vh; }
.stack-card {
  --card-bg: var(--surface); --dim: 0;
  position: sticky; top: calc(var(--nav-h) + 1.25rem + var(--i) * 1.1rem);
  display: grid; grid-template-columns: 1fr 1.05fr; gap: clamp(1.25rem, 3vw, 2.5rem);
  width: min(1180px, 100%); margin-inline: auto; height: min(72vh, 620px);
  padding: clamp(1rem, 2vw, 1.5rem); background: var(--card-bg);
  border: 1px solid var(--line); border-radius: var(--radius);
  box-shadow: var(--shadow-stack); transform-origin: 50% 0;
}
.stack-card::after { /* dimming overlay animated via --dim */
  content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  background: rgba(var(--ink-rgb), 1); opacity: var(--dim);
}
.stack-card--sand { --card-bg: var(--surface-alt); }
.stack-card--sage { --card-bg: var(--sage-soft); }
.stack-card__media { position: relative; overflow: hidden; border-radius: calc(var(--radius) - 2px); border: 1px solid var(--line); }
.stack-card__media img { width: 100%; height: 115%; object-fit: cover; transition: transform 1.2s var(--ease-out); }
.stack-card:hover .stack-card__media img { transform: scale(1.04); }
.stack-card__link:focus-visible { outline: 2px solid var(--sage-deep); outline-offset: 4px; border-radius: 4px; }
```

### Navigation (two-tier, sticky)
```css
.nav { position: sticky; top: 0; z-index: 50; }
.nav__bar {
  position: relative; z-index: 2; height: 72px; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center;
  padding-inline: var(--gutter); background: rgba(var(--bg-rgb), .94);
  backdrop-filter: saturate(1.2) blur(10px); border-bottom: 1px solid var(--line);
  transition: box-shadow .4s var(--ease-out);
}
.nav.is-stuck .nav__bar { box-shadow: var(--shadow-subtle); }
.nav__strip {
  position: relative; z-index: 1; height: 36px; display: flex; align-items: center; justify-content: center;
  background: var(--sage); color: var(--ink); font: 500 .8125rem/1 var(--font-body); letter-spacing: .04em;
  transition: transform .45s var(--ease-out);
}
.nav.is-compact .nav__strip { transform: translateY(-100%); }
.nav__link { position: relative; padding: .75rem .25rem; color: var(--ink); text-decoration: none; font: 500 .8125rem/1 var(--font-body); letter-spacing: .12em; text-transform: uppercase; }
.nav__link::after { content: ""; position: absolute; left: .25rem; right: .25rem; bottom: .45rem; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: right; transition: transform .45s var(--ease-out); }
.nav__link:hover::after, .nav__link[aria-current="page"]::after { transform: scaleX(1); transform-origin: left; }
.nav__link:focus-visible { outline: 2px solid var(--sage-deep); outline-offset: 2px; border-radius: 4px; }
```

### Links (inline)
```css
.link { color: var(--accent); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: .22em; transition: color .25s, text-decoration-color .25s; }
.link:hover { color: var(--accent-hover); text-decoration-color: var(--sage); }
.link:focus-visible { outline: 2px solid var(--sage-deep); outline-offset: 2px; border-radius: 2px; }
.link-arrow { display: inline-flex; align-items: center; gap: .5rem; min-height: 44px; font: 600 .8125rem/1 var(--font-body); letter-spacing: .12em; text-transform: uppercase; color: var(--ink); text-decoration: none; }
.link-arrow svg { transition: transform .4s var(--ease-out); }
.link-arrow:hover svg { transform: translateX(6px); }
```

### Tags / Chips / Handle pill
```css
.tag { display: inline-flex; align-items: center; gap: .4rem; padding: .45rem .8rem; border-radius: 999px; background: var(--sage-soft); color: var(--ink-soft); font: 600 .6875rem/1 var(--font-body); letter-spacing: .14em; text-transform: uppercase; }
.chip { display: inline-flex; padding: .25rem .55rem; border: 1px solid var(--line); border-radius: 999px; color: var(--ink-muted); font: 500 .6875rem/1.2 var(--font-body); letter-spacing: .04em; transition: border-color .25s, color .25s; }
.chip:hover { border-color: var(--line-strong); color: var(--ink); }
.handle-pill { padding: .55rem .9rem; border: 1px solid var(--caramel); border-radius: 999px; background: var(--surface); font: 600 .75rem/1 var(--font-body); letter-spacing: .14em; text-transform: uppercase; }
```

### Menu row (dotted leader)
```css
.menu-row { display: grid; grid-template-columns: 1fr auto; gap: .35rem 1rem; padding-block: 1.1rem; border-bottom: 1px solid var(--line); }
.menu-row__name { display: flex; align-items: baseline; gap: .75rem; font: 500 1.25rem/1.25 var(--font-display); color: var(--ink); }
.menu-row__name::after { content: ""; flex: 1; border-bottom: 1px dotted var(--caramel); transform: translateY(-.25em); }
.menu-row__price { font: 600 1rem/1.2 var(--font-body); font-variant-numeric: tabular-nums; color: var(--ink); }
.menu-row__desc { grid-column: 1 / -1; color: var(--ink-muted); font-size: .9375rem; }
```

### Instagram tile / Review card / Map facade
```css
.ig-tile { position: absolute; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow-tile); }
.ig-tile img { width: 100%; height: 100%; object-fit: cover; transition: transform .8s var(--ease-out); }
.ig-tile:hover img { transform: scale(1.06); }
.review { padding: clamp(1.5rem, 3vw, 2.5rem); background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius); scroll-snap-align: start; transition: border-color .3s, transform .4s var(--ease-out); }
.review:hover { border-color: var(--line-strong); transform: translateY(-4px); }
.map-facade { position: relative; aspect-ratio: 4 / 3; border-radius: var(--radius); background: var(--sage-soft); overflow: hidden; }
.map-facade button:focus-visible { outline: 2px solid var(--sage-deep); outline-offset: 3px; }
```

## 5. Layout Principles

**Container**
- Max width: `--container: 1320px`. Narrow (text): `--container-narrow: 760px`.
- Gutter: `--gutter: clamp(1rem, 4vw, 3rem)` (16px on phones).

**Spacing Scale** (8-pt based)
- `--space-1: .5rem` · `--space-2: 1rem` · `--space-3: 1.5rem` · `--space-4: 2rem` · `--space-5: 3rem` · `--space-6: 4.5rem` · `--space-7: 7rem`
- Section padding: `clamp(4.5rem, 10vw, 9rem)` block.
- Component gap: `var(--space-4)`. Card internal padding: `clamp(1rem, 2vw, 1.5rem)`.

**Page order (home)**: Hero (sticky curtain) → Nav (sticky) → Statement → Marquee → Stacked cards → Founders → Menu teaser → Reviews → Instagram → Visit → Reveal footer.

**Layering (the "curtain")**
```
body
├─ .page            position:relative; z-index:1   ← stacks above the footer, bounds the sticky hero
│  ├─ .hero         position:sticky; top:0; z-index:0 (hidden via .is-covered once fully covered)
│  ├─ .nav          position:sticky; top:0; z-index:50 (.is-stuck / .is-compact / .is-away)
│  └─ main.curtain  position:relative; z-index:2; bg; rounded bottom; overflow:clip; --shadow-curtain
└─ footer           position:sticky; bottom:0; z-index:0  ← revealed as the curtain lifts
```
**Layout guards (JS):** a sticky element taller than the viewport hides content, so the footer falls back to `.is-static` when taller than the viewport, and the card stack un-sticks **all** cards (`.is-unstuck`) if any card doesn't fit. Short laptop screens (≤820px tall) get tighter card offsets and a smaller footer wordmark so both effects survive. Keyboard focus entering the footer scrolls to the end so focused links are never covered.

**Grid**
```css
.container { width: min(var(--container), 100% - 2 * var(--gutter)); margin-inline: auto; }
.grid-2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: clamp(2rem, 5vw, 5rem); align-items: center; }
.grid-12 { display: grid; grid-template-columns: repeat(12, minmax(0, 1fr)); gap: var(--space-3); }
```

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | 1px `--line` border, no shadow | menu sheets, info cards, chips |
| Subtle | `--shadow-subtle: 0 1px 0 rgba(var(--ink-rgb), .04), 0 8px 24px -12px rgba(var(--ink-rgb), .18)` | stuck nav, hovered review |
| Stack | `--shadow-stack: 0 -18px 40px -24px rgba(var(--ink-rgb), .28)` | sticky stacked cards (shadow cast upward onto previous card) |
| Tile | `--shadow-tile: 0 18px 40px -18px rgba(var(--ink-rgb), .35)` | IG collage tiles |
| Curtain | `--shadow-curtain: 0 40px 80px -40px rgba(var(--ink-rgb), .45)` | bottom edge of `<main>` over the reveal footer |

Atmosphere: a fixed **paper-grain** overlay (pre-rendered SVG `feTurbulence`, opacity .07, `mix-blend-mode: multiply`, `pointer-events: none`) and **soft blobs** (`radial-gradient` in `rgba(var(--sage-rgb), .35)` / `rgba(var(--caramel-rgb), .18)`) behind the statement, founders and Instagram sections.

Radius: `--radius: 8px` (images, cards) · pills `999px`.

## 7. Animation & Interaction

**Motion Philosophy**: "Unhurried service." Things arrive like plates at the table: smooth, confident, never bouncy. Only `transform`, `opacity` and `clip-path` are animated.
**Tier**: L2

### Dependencies
```bash
npm i gsap lenis
```
```js
import gsap from 'gsap'; import { ScrollTrigger } from 'gsap/ScrollTrigger'; import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
```

### Base Setup
```js
gsap.registerPlugin(ScrollTrigger, SplitText);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reduce) {
  const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
}
```
Easing tokens: `--ease-out: cubic-bezier(.22, 1, .36, 1)` · `--ease-in-out: cubic-bezier(.65, 0, .35, 1)`; GSAP: `expo.out`, `power3.out`.

### Entrance Animation (hero, on load)
```css
html.motion-ok .hero__wordmark { clip-path: inset(100% 0 0 0); }
html.motion-ok .hero__img { transform: scale(1.12); }
html.motion-ok [data-hero-fade] { opacity: 0; transform: translateY(16px); }
```
```js
gsap.timeline({ defaults: { ease: 'expo.out' } })
  .to('.hero__img', { scale: 1, duration: 2.4 }, 0)
  .to('.hero__wordmark', { clipPath: 'inset(0% 0 0 0)', duration: 1.6 }, 0.25)
  .to('[data-hero-fade]', { opacity: 1, y: 0, duration: 1.1, stagger: 0.08 }, 0.7);
```
The `motion-ok` class is set by an inline head script only when reduced motion is off. A 3s failsafe removes it if the motion module never loads.

### Scroll Behavior
| Block | Trigger | Effect | Timing |
|---|---|---|---|
| Hero | page scroll 0→100vh | wordmark `yPercent: 0→-25`, image `scale 1→1.08` | scrub |
| Statement H1 | enters 80% | SplitText words in line masks, `yPercent 110→0` | 1.1s, stagger .05, expo.out, once |
| Section H2 `[data-split]` | enters 85% | chars `yPercent 100→0, rotate 6→0, opacity 0→1` | .9s, stagger .018, once |
| `[data-reveal]` | batch, enters 88% | `y 28→0, opacity 0→1` | .9s, stagger .08, once |
| `[data-draw]` SVG | enters 80% | `stroke-dashoffset len→0` | 1.4s, power2.inOut |
| `[data-parallax]` | in view | `yPercent: ±n` | scrub |
| Stacked cards | next card top → its sticky top | previous card `scale 1→.94`, `--dim 0→.28` | scrub |
| IG collage | section in view | tile `yPercent` by depth (±12/22/34) | scrub |
| Marquee | always | xPercent −50 loop; `timeScale` follows Lenis velocity, flips with scroll direction | 38s base |
| Nav | scroll | `.is-stuck` after hero; `.is-compact` on scroll down, removed on scroll up | .45s |

### Hover & Focus States
- Buttons: text-swap labels and a background change to sage-deep. Magnetic pull on `.magnetic` (max 10px, `(hover: hover)` only, rAF-throttled `quickTo`).
- Nav links: underline wipe (left-in, right-out).
- Cards and IG tiles: image `scale(1.04–1.06)` over .8–1.2s.
- Reviews: lift 4px and border to `--line-strong`.
- Every interactive element: `:focus-visible { outline: 2px solid var(--sage-deep); outline-offset: 2–4px }`.

### Special Effects
- **Text-swap button** (yauya's, refined with expo easing).
- **Handwritten note + self-drawing arrow** next to the statement ("simpl ampak duobr").
- **IG mouse drift**: on `(hover: hover)`, tiles' inner wrappers translate by `--mx/--my × depth` (rAF), independent of the GSAP scroll transform.
- **Easter egg**: hovering, tapping or focusing the footer frog makes it bow (rotate -8° and back) and shows a speech bubble ("Dober tek!" / "Bon appétit!").

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; scroll-behavior: auto !important; }
  .marquee__track { animation: none !important; transform: none !important; }
  .stack-card { position: relative; top: auto; }
}
```
JS also skips Lenis, all ScrollTriggers, the hero timeline and mouse drift. Content is fully visible with no hidden initial states.

## 8. Do's and Don'ts

### Do
- Lead with real Bombina photography: food on wood, vintage porcelain, candlelight.
- Keep one italic accent phrase per headline and one hand note per section at most.
- Use the brush wordmark big (hero, footer) and the frog small (nav, favicon, easter egg).
- Keep body text on `--bg`, `--surface` or `--surface-alt` at ≥4.5:1 contrast.
- Pair every hover effect with an equivalent `:focus-visible` style.
- Write Slovenian first with natural English equivalents. Prices use the Slovenian format `12,00 €`.
- Load the hero image eagerly with `fetchpriority="high"`. Lazy-load everything else as AVIF/WebP.

### Don't
- ❌ No hex colours outside `tokens.css`, and no pure `#000` or `#fff`.
- ❌ No sage text on sand (fails contrast). Sage is for fills, sage-deep for text.
- ❌ No bold (≥600) Fraunces headlines and no all-caps serif headlines (that's yauya's look, not ours).
- ❌ No `filter: blur()` animations, no WebGL, and no parallax on more than ~10 elements at once.
- ❌ No emoji in UI chrome. Icons are inline SVG (lucide-style 1.5px strokes).
- ❌ No upscaling the 150px frog beyond 64px CSS size.
- ❌ No third-party embeds that load before consent (the map is click-to-load; Instagram uses local images).
- ❌ No grey placeholder blocks. Every image slot has a real photo.
- ❌ No scroll-jacking beyond Lenis smoothing: no pinned sections that trap the user.
- ❌ No text over busy photo areas without a scrim.

## 9. Responsive Behavior

**Breakpoints**
| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | > 1024px | Two-tier nav with links left/right, stacked cards 2-col, IG collage with 8 tiles + mouse drift |
| Tablet | 601–1024px | Nav collapses to burger + centered frog, cards 2-col with smaller type, IG 6 tiles |
| Mobile | ≤ 600px | Cards single column (image top 45%, text bottom), sticky offsets smaller, IG 5 tiles at 3 depths, footer columns stack |

**Touch Targets:** minimum 44 × 44px (buttons 48px tall, nav links padded, chips decorative only).
**Collapsing Strategy:** the nav becomes a full-screen linen overlay with large Fraunces links (staggered in), the language toggle and a reserve button. The strip text becomes a slow marquee. Hero wordmark stays full width. The reviews row becomes swipeable scroll-snap.

```css
@media (max-width: 1024px) {
  .nav__links { display: none; }
  .nav__burger { display: inline-flex; }
}
@media (max-width: 600px) {
  :root { --nav-h: 100px; }
  .stack-card { grid-template-columns: 1fr; grid-template-rows: 45% 1fr; height: min(78svh, 640px); top: calc(var(--nav-h) + .75rem + var(--i) * .6rem); }
  .footer__cols { grid-template-columns: 1fr; text-align: center; }
}
```

## 10. Reference Difference Audit (yauya.si → Bombina)

| Area | yauya | Bombina | Why |
|---|---|---|---|
| Hero | sticky 100svh photo, full-width svg logo, black gradient | Same curtain + Ken-Burns + clip-path wordmark reveal + scroll parallax | More "arrival" on load |
| Nav | cream bar + caramel strip with white text | cream bar + **sage** strip with ink text | yauya strip fails contrast (2.7:1) |
| Cards | static sticky stack, uppercase serif | stack **recedes** (scale + dim), tinted cards, index numbers, CTAs | Depth and clearer purpose |
| Instagram | 7 static squares + Elfsight | 8 tiles with depth parallax + mouse drift + two-row marquee, no third party | Livelier, faster, GDPR-friendly |
| Footer | caramel #af9978 + light beige text | caramel-deep #7A6347 + linen text, curtain shadow, frog easter egg | Contrast 5.1:1, delight |
| Type | Lamore (all caps) + Volte | Fraunces (sentence case, italic accent) + DM Sans + Caveat notes | Homier, personal voice |
