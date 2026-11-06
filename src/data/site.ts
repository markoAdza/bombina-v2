import type { L10n } from '../i18n/utils';

/** Contact details, socials and opening hours. Edit here; the whole site updates. */
export const site = {
  name: 'Bistro Bombina',
  owners: 'Urh & Barbara',
  url: 'https://www.bistrobombina.com',
  phone: '031 492 912',
  phoneIntl: '+386 31 492 912',
  phoneHref: 'tel:+38631492912',
  email: 'bombinabistro@gmail.com',
  address: {
    street: 'Ulica 1. junija 8',
    postalCode: '1420',
    city: 'Trbovlje',
    country: 'SI',
  },
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Bistro%20Bombina%2C%20Ulica%201.%20junija%208%2C%201420%20Trbovlje',
  mapsEmbed: 'https://www.google.com/maps?q=Ulica+1.+junija+8,+1420+Trbovlje,+Slovenia&z=16&output=embed',
  instagram: 'https://www.instagram.com/bombinabistro/',
  instagramHandle: '@bombinabistro',
  facebook: 'https://facebook.com/bistrobombina',
} as const;

/** Local format on Slovenian pages, international on English ones. */
export const phoneFor = (lang: 'sl' | 'en') => (lang === 'en' ? site.phoneIntl : site.phone);

/* ------------------------------------------------------------------------
 * OPENING HOURS
 * TODO(Bombina): these are PLACEHOLDER hours (the old site listed none).
 * Replace them with the real ones, then set `hoursConfirmed = true` —
 * that also adds them to Google's structured data (JSON-LD).
 * --------------------------------------------------------------------- */
export const hoursConfirmed = false;

export interface HoursRow {
  days: L10n;
  /** "HH:MM – HH:MM" or null when closed */
  time: string | null;
  /** schema.org days for JSON-LD */
  schemaDays: string[];
  opens?: string;
  closes?: string;
}

export const hours: HoursRow[] = [
  { days: { sl: 'Ponedeljek', en: 'Monday' }, time: null, schemaDays: ['Monday'] },
  { days: { sl: 'Torek – petek', en: 'Tuesday – Friday' }, time: '11:00 – 22:00', schemaDays: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '11:00', closes: '22:00' },
  { days: { sl: 'Sobota', en: 'Saturday' }, time: '12:00 – 22:00', schemaDays: ['Saturday'], opens: '12:00', closes: '22:00' },
  { days: { sl: 'Nedelja', en: 'Sunday' }, time: '12:00 – 17:00', schemaDays: ['Sunday'], opens: '12:00', closes: '17:00' },
];

/** Short line used in the nav strip. */
export const hoursShort: L10n = {
  sl: 'Tor–pet 11–22 · Sob 12–22 · Ned 12–17',
  en: 'Tue–Fri 11–22 · Sat 12–22 · Sun 12–17',
};

if (!hoursConfirmed) {
  console.warn('\n[bombina] ⚠  Opening hours in src/data/site.ts are PLACEHOLDERS — set real hours and hoursConfirmed = true.\n');
}
