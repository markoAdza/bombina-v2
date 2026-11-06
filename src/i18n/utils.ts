export const languages = { sl: 'Slovenščina', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'sl';

/** A string in both languages. */
export type L10n = Record<Lang, string>;

export const tx = (value: L10n, lang: Lang) => value[lang] ?? value[defaultLang];

/** Route map: the same page in both languages (used by nav + language toggle + hreflang). */
export const routes = {
  home: { sl: '/', en: '/en/' },
  menu: { sl: '/meni/', en: '/en/menu/' },
  catering: { sl: '/catering/', en: '/en/catering/' },
} as const satisfies Record<string, L10n>;

export type RouteKey = keyof typeof routes;

/** Section anchors differ per language for nicer URLs. */
export const anchors = {
  about: { sl: 'o-nas', en: 'about' },
  visit: { sl: 'obisk', en: 'visit' },
  weekly: { sl: 'tedenska-ponudba', en: 'weekly-specials' },
  seasonal: { sl: 'martinovanje', en: 'seasonal-menu' },
  desserts: { sl: 'sladko', en: 'desserts' },
  alacarte: { sl: 'jedilnik', en: 'a-la-carte' },
} as const satisfies Record<string, L10n>;

export type AnchorKey = keyof typeof anchors;

export const href = (key: RouteKey, lang: Lang, anchor?: AnchorKey) =>
  routes[key][lang] + (anchor ? `#${anchors[anchor][lang]}` : '');

export const anchorId = (key: AnchorKey, lang: Lang) => anchors[key][lang];

export const htmlLang = (lang: Lang) => (lang === 'sl' ? 'sl-SI' : 'en-GB');

/** 12 → "12,00 €" (sl) / "€12.00" (en) */
export function formatPrice(value: number, lang: Lang) {
  return new Intl.NumberFormat(lang === 'sl' ? 'sl-SI' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(iso: string, lang: Lang) {
  return new Intl.DateTimeFormat(lang === 'sl' ? 'sl-SI' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).format(
    new Date(iso),
  );
}
