#!/usr/bin/env node
/**
 * Prepares every image the site uses.
 *
 *   npm run assets
 *
 * 1. Downloads original photos from the old Webador site → .asset-cache/site/   (cached)
 * 2. Optimises them into src/assets/photos/*.jpg                            (Astro makes AVIF/WebP)
 * 3. Converts Instagram drops in ./instagram/ → src/assets/instagram/*.jpg  (crops carousel arrows)
 * 4. Vectorises the brush wordmark + the frog waiter → public/brand/*.svg (fill = currentColor)
 * 5. Writes favicons + og-image.jpg → public/
 *
 * Tracing needs `potrace` (dev-only, not kept installed):  npm i -D potrace  → npm run assets
 */
import { mkdir, readdir, writeFile, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const p = (...s) => path.join(root, ...s);

const CDN = 'https://primary.jwwb.nl/public/r/s/k/temp-jwtovxzdrixnlbmgvhqu';
const SITE_PHOTOS = {
  'hero-table': '/bombina_2-high.jpg',
  'duck-morels': '/bombina_31-1-high.jpg',
  'kitchen-plating': '/444167241_987838576683364_5973223915273660749_n-high.jpg',
  'wall-mural': '/443861020_987838590016696_8272926196572490441_n-high-8j7u6f.jpg',
  'founders': '/image-high-jkmo8c.png',
  'pork-chop-jus': '/image00035-high.jpg',
  'roast-beef': '/image00028-high.jpg',
  'fried-chicken': '/image00032-high.jpg',
  'catering-spread': '/458492507_10230632182362221_8245410531850376793_n-high-ydtf7a.jpg',
};
const WORDMARK_URL = `${CDN}/9rorm4/napisbb_png.png`;
const FROG_SRC = process.env.FROG_SRC || p('brand-source', 'frog-waiter-150.png');

/** Instagram drop-zone renames + crops ({left,right,top,bottom} px to trim, e.g. carousel arrows). */
const IG = {
  'dish.png': { name: 'pad-thai' },
  'dish2.png': { name: 'fritters-salad' },
  'dish3.png': { name: 'chicken-kiev' },
  'pasta.png': { name: 'seafood-tagliatelle' },
  'table.png': { name: 'coffee-press' },
  'bistroBombina.png': { name: 'interior-candles' },
  'Screenshot 2026-11-06 212550.png': { name: 'tartare-bread' },
  'Screenshot 2026-11-06 212717.png': { name: 't-bone', trim: { left: 40, right: 40 } },
  'Screenshot 2026-11-06 212744.png': { name: 'mushrooms', trim: { left: 40, right: 40 } },
  'Screenshot 2026-11-06 212811.png': { name: 'semifreddo-dark', trim: { left: 34, right: 36 } },
  'Screenshot 2026-11-06 212834.png': { name: 'semifreddo-sun' },
  'Screenshot 2026-11-06 212856.png': { name: 'french-toast' },
  'Screenshot 2026-11-06 212919.png': { name: 'caesar-salad' },
  'Screenshot 2026-11-06 213026.png': { name: 'sardines-salsa-verde' },
};

const slug = (s) => s.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const exists = async (f) => access(f).then(() => true, () => false);

async function download(url, dest) {
  if (await exists(dest)) return dest;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
  console.log('  ↓', path.basename(dest));
  return dest;
}

async function sitePhotos() {
  console.log('• Site photos');
  await mkdir(p('.asset-cache', 'site'), { recursive: true });
  await mkdir(p('src', 'assets', 'photos'), { recursive: true });
  for (const [name, file] of Object.entries(SITE_PHOTOS)) {
    const raw = await download(CDN + file, p('.asset-cache', 'site', path.basename(file)));
    await sharp(raw).rotate().flatten({ background: '#ffffff' })
      .resize({ width: 2000, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 86, mozjpeg: true })
      .toFile(p('src', 'assets', 'photos', `${name}.jpg`));
    console.log('  ✓ photos/' + name + '.jpg');
  }
}

async function instagram() {
  const dir = p('instagram');
  if (!existsSync(dir)) return console.log('• Instagram: no ./instagram folder, skipped');
  console.log('• Instagram drops');
  await mkdir(p('src', 'assets', 'instagram'), { recursive: true });
  const files = (await readdir(dir)).filter((f) => /\.(png|jpe?g|webp|avif)$/i.test(f));
  for (const f of files) {
    const cfg = IG[f] ?? { name: slug(f) };
    const img = sharp(path.join(dir, f)).rotate();
    const { width, height } = await img.metadata();
    const t = { left: 0, right: 0, top: 0, bottom: 0, ...(cfg.trim ?? {}) };
    await img
      .extract({ left: t.left, top: t.top, width: width - t.left - t.right, height: height - t.top - t.bottom })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(p('src', 'assets', 'instagram', `${cfg.name}.jpg`));
    console.log('  ✓ instagram/' + cfg.name + '.jpg');
  }
}

/** Threshold a raster to pure black/white PNG buffer (ink = black), upscaled for smooth curves. */
async function bitmap(input, { scale = 3, threshold = 150, extract } = {}) {
  let img = sharp(input).flatten({ background: '#ffffff' }).grayscale();
  if (extract) img = sharp(await img.extract(extract).png().toBuffer());
  const { width, height } = await img.metadata();
  return img.resize(width * scale, height * scale, { kernel: 'lanczos3' }).threshold(threshold).png().toBuffer();
}

/** Row/column ink bounds of a b/w PNG buffer. */
async function inkBounds(buf) {
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const rows = new Array(height).fill(0);
  let minX = width, maxX = 0;
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    if (data[(y * width + x) * channels] < 128) { rows[y]++; if (x < minX) minX = x; if (x > maxX) maxX = x; }
  }
  return { rows, minX, maxX, width, height };
}

async function trace(buf, opts = {}) {
  let potrace;
  try { potrace = (await import('potrace')).default; } catch {
    console.warn('  ! potrace not installed: skipping vector tracing (npm i -D potrace)');
    return null;
  }
  return new Promise((resolve, reject) => {
    potrace.trace(buf, { threshold: 128, turdSize: 6, optTolerance: 0.3, alphaMax: 1, color: 'currentColor', background: 'transparent', ...opts },
      (err, svg) => (err ? reject(err) : resolve(svg)));
  });
}

/** potrace output → tight, responsive, currentColor SVG. */
function tidySvg(svg, w, h, title) {
  // integer coordinates are plenty at 3–6× trace scale and roughly halve the file size
  const d = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(' ')
    .replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n))))
    .replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').trim();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" fill="currentColor" role="img" aria-label="${title}"><title>${title}</title><path fill-rule="evenodd" d="${d}"/></svg>\n`;
}

async function tracePart(buf, box, title, outName) {
  const crop = await sharp(buf).extract(box).png().toBuffer();
  const svg = await trace(crop);
  if (!svg) return;
  await writeFile(p('public', 'brand', outName), tidySvg(svg, box.width, box.height, title));
  console.log('  ✓ public/brand/' + outName, `${box.width}×${box.height}`);
}

async function wordmark() {
  console.log('• Wordmark');
  await mkdir(p('public', 'brand'), { recursive: true });
  await mkdir(p('brand-source'), { recursive: true });
  const raw = await download(WORDMARK_URL, p('brand-source', 'wordmark-brush.png'));
  const buf = await bitmap(raw, { scale: 3, threshold: 140 });
  const { rows, width, height } = await inkBounds(buf);
  // split into ink bands (BOMBINA / BISTRO) separated by empty rows
  const bands = []; let start = -1;
  rows.forEach((n, y) => {
    if (n > 0 && start < 0) start = y;
    if ((n === 0 || y === rows.length - 1) && start >= 0) { bands.push([start, y]); start = -1; }
  });
  const big = bands.filter(([a, b]) => b - a > height * 0.04);
  const merged = [];
  for (const b of big) { const last = merged.at(-1); if (last && b[0] - last[1] < height * 0.03) last[1] = b[1]; else merged.push([...b]); }
  const pad = 6;
  const colBounds = async (y0, y1) => {
    const band = await sharp(buf).extract({ left: 0, top: y0, width, height: y1 - y0 }).png().toBuffer();
    const { minX, maxX } = await inkBounds(band); return [minX, maxX];
  };
  const boxFor = async ([y0, y1]) => {
    const [x0, x1] = await colBounds(y0, y1);
    const left = Math.max(0, x0 - pad), top = Math.max(0, y0 - pad);
    return { left, top, width: Math.min(width - left, x1 - x0 + pad * 2), height: Math.min(height - top, y1 - y0 + pad * 2) };
  };
  if (merged.length >= 2) {
    await tracePart(buf, await boxFor(merged[0]), 'Bombina', 'wordmark-bombina.svg');
    await tracePart(buf, await boxFor(merged[merged.length - 1]), 'Bistro', 'wordmark-bistro.svg');
  }
  await tracePart(buf, await boxFor([merged[0][0], merged.at(-1)[1]]), 'Bistro Bombina', 'wordmark-full.svg');
}

async function frog() {
  console.log('• Frog waiter');
  if (!(await exists(FROG_SRC))) return console.warn('  ! frog source missing:', FROG_SRC);
  const buf = await bitmap(FROG_SRC, { scale: 6, threshold: 160 });
  const { rows, minX, maxX, width } = await inkBounds(buf);
  const y0 = rows.findIndex((n) => n > 0), y1 = rows.length - 1 - [...rows].reverse().findIndex((n) => n > 0);
  const pad = 12;
  const left = Math.max(0, minX - pad), top = Math.max(0, y0 - pad);
  const box = { left, top, width: Math.min(width - left, maxX - minX + pad * 2), height: Math.min(rows.length - top, y1 - y0 + pad * 2) };
  const crop = await sharp(buf).extract(box).png().toBuffer();
  const svg = await trace(crop, { turdSize: 20, optTolerance: 0.4 });
  if (svg) {
    await writeFile(p('public', 'brand', 'frog-waiter.svg'), tidySvg(svg, box.width, box.height, 'Žabji natakar Bombina'));
    console.log('  ✓ brand/frog-waiter.svg');
  }
  // transparent raster fallback (ink only)
  const { data, info } = await sharp(FROG_SRC).flatten({ background: '#ffffff' }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    const a = 255 - data[i];
    rgba[i * 4] = 30; rgba[i * 4 + 1] = 26; rgba[i * 4 + 2] = 21; rgba[i * 4 + 3] = a < 24 ? 0 : a;
  }
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(p('public', 'brand', 'frog-waiter.png'));
  console.log('  ✓ brand/frog-waiter.png');

  // favicons: crisp frog (rendered from the traced SVG when available) on a linen/sage tile
  await mkdir(p('public'), { recursive: true });
  const svgPath = p('public', 'brand', 'frog-waiter.svg');
  const frogSrc = (await exists(svgPath)) ? svgPath : FROG_SRC;
  const tile = (size, radius, fill) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${fill}"/></svg>`);
  const frogPng = (h) => sharp(frogSrc, { density: 300 }).resize({ height: h, kernel: 'lanczos3' }).png().toBuffer();
  const icon = async (size, radius, frogH, out, fill = '#F7F2EA') => {
    const f = await frogPng(frogH); const { width } = await sharp(f).metadata();
    await sharp(tile(size, radius, fill)).composite([{ input: f, left: Math.round((size - width) / 2), top: Math.round((size - frogH) / 2) }]).png().toFile(p('public', out));
  };
  await icon(180, 0, 156, 'apple-touch-icon.png');
  await icon(512, 112, 440, 'icon-512.png');
  console.log('  ✓ public/apple-touch-icon.png, icon-512.png');
}

/** Tiny favicon: the brush "B" (first subpaths of the wordmark) on a sage tile. */
async function favicon() {
  console.log('• Favicon');
  const src = p('public', 'brand', 'wordmark-bombina.svg');
  if (!(await exists(src))) return console.warn('  ! run wordmark first');
  const svg = await (await import('node:fs/promises')).readFile(src, 'utf8');
  const d = svg.match(/ d="([^"]+)"/)[1];
  const [, vbH] = svg.match(/viewBox="0 0 \d+ (\d+)"/);
  const bWidth = 570; // the "B" occupies the first ~18.5% of BOMBINA
  const subs = d.split(/(?=M )/).filter((s) => Number(s.trim().split(/[ ,]/)[1]) < bWidth - 10);
  const size = 900, tx = Math.round((size - bWidth) / 2), ty = Math.round((size - Number(vbH)) / 2);
  const fav = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="200" fill="#DDE3D1"/><path transform="translate(${tx} ${ty})" fill="#1E1A15" fill-rule="evenodd" d="${subs.join(' ').trim()}"/></svg>\n`;
  await writeFile(p('public', 'favicon.svg'), fav);
  for (const s of [32, 64]) await sharp(Buffer.from(fav), { density: 72 }).resize(s, s).png().toFile(p('public', `favicon-${s}.png`));
  console.log('  ✓ public/favicon.svg, favicon-32.png, favicon-64.png', `(${Math.round(fav.length / 1024)} KB)`);
}

/** 1200×630 social preview: hero photo + linen wordmark. */
async function og() {
  console.log('• OG image');
  const photo = p('src', 'assets', 'photos', 'hero-table.jpg');
  const mark = p('public', 'brand', 'wordmark-bombina.svg');
  if (!(await exists(photo)) || !(await exists(mark))) return console.warn('  ! run photos + wordmark first');
  const svg = (await import('node:fs/promises')).readFile(mark, 'utf8');
  const cream = Buffer.from((await svg).replace('fill="currentColor"', 'fill="#F7F2EA"'));
  const markPng = await sharp(cream, { density: 72 }).resize({ width: 1080 }).png().toBuffer();
  const { height: mh } = await sharp(markPng).metadata();
  const scrim = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="#1E1A15" stop-opacity="0"/><stop offset="1" stop-color="#1E1A15" stop-opacity=".78"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/></svg>`);
  await sharp(photo).resize(1200, 630, { fit: 'cover', position: 'centre' })
    .composite([{ input: scrim }, { input: markPng, left: 60, top: 630 - mh - 48 }])
    .jpeg({ quality: 84, mozjpeg: true }).toFile(p('public', 'og-image.jpg'));
  console.log('  ✓ public/og-image.jpg');
}

const only = process.argv[2];
const steps = { photos: sitePhotos, instagram, wordmark, frog, favicon, og };
for (const [k, fn] of Object.entries(steps)) if (!only || only === k) await fn();
console.log('Done.');
