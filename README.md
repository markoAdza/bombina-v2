# Bistro Bombina — website

The new website for **Bistro Bombina** (Ulica 1. junija 8, 1420 Trbovlje), run by Urh & Barbara.
It's a static [Astro](https://astro.build) site in Slovenian (default) and English. The design spec lives in [`DESIGN.md`](DESIGN.md).

| Page | Slovenian | English |
|---|---|---|
| Home | `/` | `/en/` |
| Menu | `/meni/` | `/en/menu/` |
| Catering | `/catering/` | `/en/catering/` |

## Before going live

- [ ] **Opening hours are placeholders.** Set the real ones in [`src/data/site.ts`](src/data/site.ts), then set `hoursConfirmed = true`. That also publishes them to Google via structured data, and removes the build warning.
- [ ] Check the domain in `astro.config.mjs` (`site: 'https://www.bistrobombina.com'`). It is used for canonical URLs, the sitemap and social previews.

## Quick start

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static site → dist/
npm run preview   # serve dist/ locally
npm run check     # type-check
```

This needs Node **22.12+**. Astro is pinned to `~7.3.8` because Astro 7.4+ requires Node ≥ 22.23. Once Node is updated, run `npx @astrojs/upgrade`.

## Updating content

Everything editable lives in plain TypeScript files. Comments in each file explain the format.

| What | File |
|---|---|
| Menu: à la carte, weekly specials, desserts, seasonal set menus, allergens, "last updated" date | [`src/data/menu.ts`](src/data/menu.ts) |
| Phone, email, address, socials, **opening hours** | [`src/data/site.ts`](src/data/site.ts) |
| Guest reviews (with translations) | [`src/data/reviews.ts`](src/data/reviews.ts) |
| All page text in SL + EN (TypeScript makes sure no English string is missing) | [`src/i18n/copy.ts`](src/i18n/copy.ts) |
| Which photos appear where | [`src/data/images.ts`](src/data/images.ts) and the components in `src/components/` |

Prices are plain numbers (`12` or `[6.5, 9.5]` for small/large). They render as `12,00 €` on Slovenian pages and `€12.00` on English ones. Mark a dish `featured: true` to show it in the home-page "Ta teden" teaser.

## Photos

- **Instagram feed (home page):** the profile banner (posts, followers, following) and the 8 newest posts come straight from the public [@bombinabistro](https://www.instagram.com/bombinabistro/) profile. To refresh them, run:
  ```bash
  npm run instagram   # python scripts/instagram_snapshot.py (needs: pip install playwright && python -m playwright install chromium)
  npm run build
  ```
  The script opens the profile in headless Chromium. It writes `src/data/instagram.json` and the images in `src/assets/instagram-feed/`, and saves a screenshot to `.asset-cache/instagram/profile.png` so you can check the numbers. Instagram hides like and comment counts from logged-out visitors. To show them in the hover overlay, type them into `instagram.json` (`"likes": 123, "comments": 4`). A refresh keeps them. If Instagram ever shows a login wall, the script stops and leaves the existing data alone.
- **Instagram photos used elsewhere** (menu page, cards, founders): drop images into `./instagram/` (git-ignored), then run:
  ```bash
  node scripts/prepare-assets.mjs instagram
  ```
  They're converted into `src/assets/instagram/`. Pick them by name with `ig('slug')` from `src/data/images.ts`. For carousel screenshots with arrow buttons, add a `trim` entry in `scripts/prepare-assets.mjs`.
- **Original-resolution photos** look sharper than Instagram screenshots (about 640px wide). If the bistro has the originals, replace the files in `src/assets/instagram/` or `src/assets/photos/` and keep the same file names.
- Astro generates responsive AVIF/WebP versions at build time.

`npm run assets` re-runs the whole pipeline: it downloads the old-site photos, converts the Instagram drops, traces the brush wordmark and the frog to SVG, and writes the favicons and OG image. The vector tracing step needs `npm i -D potrace` first. It isn't kept installed, because the traced SVGs are already committed in `public/brand/`, with their sources in `brand-source/`.

## How it's built

```
src/
  pages/        thin SL/EN routes → views/
  views/        HomePage, MenuPage, CateringPage
  components/   Hero, Nav, StackedCards, InstagramFeed, Visit, Footer, …
  layouts/      BaseLayout (SEO, hreflang, JSON-LD, fonts, curtain structure)
  scripts/      ui.ts (always), motion.ts (GSAP + Lenis, loaded only without reduced motion)
  styles/       tokens.css (the only file with colour values), base.css, components.css
  data/         content (see above)
  i18n/         copy + routing helpers
public/brand/   vector wordmark + frog (used as CSS masks so they recolour via tokens)
```

- **Motion (L2):** a sticky "curtain" hero, receding stacked cards, an Instagram feed that rises in row by row, split-text headlines, magnetic buttons and a reveal footer. Everything degrades to a static, fully visible page under `prefers-reduced-motion`. Sticky effects switch themselves off on screens too small to show them fully.
- **Privacy:** fonts are self-hosted and the Instagram images are local. The Google map is click-to-load, so nothing third-party loads until the visitor asks for it.
- **Easter egg:** say hello to the frog waiter in the footer.

## Deploying

The output in `dist/` is plain static files. Netlify, Vercel, Cloudflare Pages, GitHub Pages or any web host will work. Use the build command `npm run build` and the publish directory `dist`.

## Credits

- Photography: Bistro Bombina (previous website and Instagram [@bombinabistro](https://www.instagram.com/bombinabistro/)).
- Brush wordmark and frog-waiter illustration: Bistro Bombina's own artwork, vectorised.
- Fonts: Fraunces, DM Sans and Caveat (SIL Open Font License) via Fontsource.
- Motion: [GSAP](https://gsap.com) (free standard license) and [Lenis](https://lenis.darkroom.engineering) (MIT).
