import type { ImageMetadata } from 'astro';

/* Photos from the previous website (processed by `npm run assets`). */
import heroTable from '../assets/photos/hero-table.jpg';
import duckMorels from '../assets/photos/duck-morels.jpg';
import kitchenPlating from '../assets/photos/kitchen-plating.jpg';
import wallMural from '../assets/photos/wall-mural.jpg';
import founders from '../assets/photos/founders.jpg';
import porkChopJus from '../assets/photos/pork-chop-jus.jpg';
import roastBeef from '../assets/photos/roast-beef.jpg';
import friedChicken from '../assets/photos/fried-chicken.jpg';
import cateringSpread from '../assets/photos/catering-spread.jpg';

export const photos = {
  heroTable,
  duckMorels,
  kitchenPlating,
  wallMural,
  founders,
  porkChopJus,
  roastBeef,
  friedChicken,
  cateringSpread,
} satisfies Record<string, ImageMetadata>;

/* Instagram photos: every image in src/assets/instagram is picked up automatically. */
const igModules = import.meta.glob<{ default: ImageMetadata }>('../assets/instagram/*.{jpg,jpeg,png,webp,avif}', { eager: true });

export interface IgPhoto {
  slug: string;
  src: ImageMetadata;
  alt: { sl: string; en: string };
}

/** Alt texts for known Instagram photos (new drops fall back to a generic alt). */
const igAlt: Record<string, { sl: string; en: string }> = {
  'interior-candles': { sl: 'Notranjost bistroja s svečami in žabo-natakarjem na steni', en: 'Candle-lit dining room with the frog waiter painted on the wall' },
  'pad-thai': { sl: 'Rezanci s kozicami, arašidi in limeto na starinskem krožniku', en: 'Noodles with prawns, peanuts and lime on a vintage plate' },
  'fritters-salad': { sl: 'Ocvrti polpeti z rukolo, baziliko in jogurtovo omako', en: 'Fritters with rocket, basil and yoghurt sauce' },
  'chicken-kiev': { sl: 'Panirani piščanec na zeliščni maslovi omaki', en: 'Breaded chicken on a herb butter sauce' },
  'seafood-tagliatelle': { sl: 'Tagliatelle s kozicami, školjkami in češnjevimi paradižniki', en: 'Tagliatelle with prawns, mussels and cherry tomatoes' },
  'coffee-press': { sl: 'Kava in revija s člankom o Bombini na mizi bistroja', en: 'Coffee and a magazine feature about Bombina on a bistro table' },
  'tartare-bread': { sl: 'Tatarski biftek, kruh z drožmi in nariban sir', en: 'Steak tartare, sourdough bread and grated cheese' },
  't-bone': { sl: 'T-bone zrezek s poprovo omako', en: 'T-bone steak with green pepper sauce' },
  mushrooms: { sl: 'Sveže narezani šampinjoni na keramičnem krožniku', en: 'Freshly sliced mushrooms on a ceramic plate' },
  'semifreddo-dark': { sl: 'Jagodni semifreddo s sladoledom in verbeno', en: 'Strawberry semifreddo with ice cream and verbena' },
  'semifreddo-sun': { sl: 'Jagodni semifreddo na sončni leseni mizi', en: 'Strawberry semifreddo on a sunny wooden table' },
  'french-toast': { sl: 'Francoski toast z jagodami, borovnicami in vanilijevo kremo', en: 'French toast with strawberries, blueberries and vanilla custard' },
  'caesar-salad': { sl: 'Cezarjeva solata s piščancem, slanino in parmezanom', en: 'Caesar salad with chicken, bacon and parmesan' },
  'sardines-salsa-verde': { sl: 'Pečene sardele z zeleno omako', en: 'Roasted sardines with salsa verde' },
};

export const igPhotos: IgPhoto[] = Object.entries(igModules)
  .map(([file, mod]) => {
    const slug = file.split('/').pop()!.replace(/\.[^.]+$/, '');
    return { slug, src: mod.default, alt: igAlt[slug] ?? { sl: 'Fotografija z Instagrama Bistroja Bombina', en: 'Photo from Bistro Bombina on Instagram' } };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));

export const ig = (slug: string) => {
  const found = igPhotos.find((p) => p.slug === slug);
  if (!found) throw new Error(`Instagram photo "${slug}" not found in src/assets/instagram`);
  return found;
};

/** Collage order (first 8 used, falls back to whatever exists). */
const collageOrder = ['seafood-tagliatelle', 'pad-thai', 'french-toast', 'tartare-bread', 'caesar-salad', 'mushrooms', 'semifreddo-dark', 'chicken-kiev'];
export const collagePhotos: IgPhoto[] = [
  ...collageOrder.map((s) => igPhotos.find((p) => p.slug === s)).filter((p): p is IgPhoto => !!p),
  ...igPhotos.filter((p) => !collageOrder.includes(p.slug)),
].slice(0, 8);
