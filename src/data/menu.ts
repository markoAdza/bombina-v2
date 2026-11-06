import type { L10n } from '../i18n/utils';

/**
 * MENU — edit this file to update the website menu.
 * Prices are numbers in EUR (formatted automatically as "12,00 €").
 * Allergen keys: gluten | egg | lactose | fish | nuts | sulphites | mustard
 */
export type Allergen = 'gluten' | 'egg' | 'lactose' | 'fish' | 'nuts' | 'sulphites' | 'mustard';

export interface MenuItem {
  name: L10n;
  /** single price or [small, large] */
  price: number | [number, number];
  allergens?: Allergen[];
  /** shown in the home-page teaser */
  featured?: boolean;
}

export interface SetCourse {
  options: { name: L10n; allergens?: Allergen[] }[];
}

export interface SetMenu {
  title: L10n;
  price: number;
  courses: SetCourse[];
}

/** Date the menu was last updated (ISO). */
export const menuUpdated = '2026-11-06';

export const allergenLabels: Record<Allergen, L10n> = {
  gluten: { sl: 'gluten', en: 'gluten' },
  egg: { sl: 'jajca', en: 'eggs' },
  lactose: { sl: 'laktoza', en: 'lactose' },
  fish: { sl: 'riba', en: 'fish' },
  nuts: { sl: 'oreščki', en: 'nuts' },
  sulphites: { sl: 'sulfiti', en: 'sulphites' },
  mustard: { sl: 'gorčično seme', en: 'mustard seed' },
};

/** À la carte (Jedilnik) */
export const aLaCarte: MenuItem[] = [
  { name: { sl: 'Goveji tatar', en: 'Beef tartare' }, price: 12, allergens: ['fish'], featured: true },
  { name: { sl: 'Sashimi tune, redkev', en: 'Tuna sashimi, radish' }, price: 14, allergens: ['lactose', 'nuts'], featured: true },
  { name: { sl: 'Bučna juha, bučna semena', en: 'Pumpkin soup, pumpkin seeds' }, price: 4.5 },
  { name: { sl: 'Radič, krompir, ocvirki, jajce', en: 'Radicchio, potato, cracklings, egg' }, price: [6.5, 9.5], allergens: ['egg'] },
  { name: { sl: 'Krompirjevi njoki, buča, pečene gobe, slanina', en: 'Potato gnocchi, pumpkin, roasted mushrooms, bacon' }, price: 12, allergens: ['gluten', 'egg', 'lactose'], featured: true },
  { name: { sl: 'Krompirjev gratin, omaka gorgonzole, zelišča', en: 'Potato gratin, gorgonzola sauce, herbs' }, price: 11, allergens: ['lactose'] },
  { name: { sl: 'File gofa, koromač, pire krompir, maslena omaka', en: 'Amberjack fillet, fennel, mashed potatoes, butter sauce' }, price: 17, allergens: ['lactose', 'fish', 'sulphites'], featured: true },
  { name: { sl: 'Piščančji dunajski, zelena solata, pečen krompir', en: 'Chicken schnitzel, green salad, roast potatoes' }, price: 12, allergens: ['egg', 'gluten', 'lactose'] },
  { name: { sl: 'Telečji steak, poprova omaka, pomfri', en: 'Veal steak, pepper sauce, fries' }, price: 17, allergens: ['lactose', 'sulphites'], featured: true },
];

/** Sladko / desserts */
export const desserts: MenuItem[] = [
  { name: { sl: 'Tiramisu', en: 'Tiramisu' }, price: 4.5, allergens: ['lactose', 'gluten', 'egg'] },
  { name: { sl: 'Baskovski cheesecake', en: 'Basque cheesecake' }, price: 6.5, allergens: ['lactose', 'egg', 'gluten'] },
];

/** Tedenska ponudba / weekly specials */
export const weekly: MenuItem[] = [
  { name: { sl: 'Testenine karbonara', en: 'Pasta carbonara' }, price: 9.5, allergens: ['lactose', 'gluten', 'egg'] },
  { name: { sl: 'Pečene sardele, »ratatouille«', en: 'Roasted sardines, ratatouille' }, price: 10, allergens: ['lactose', 'fish', 'sulphites'], featured: true },
  { name: { sl: 'Pečena svinjska rebra, zelje, pražen krompir', en: 'Roast pork ribs, cabbage, sautéed potatoes' }, price: 9.5, allergens: ['lactose', 'sulphites', 'mustard'] },
];

/** Seasonal set menus — Martinovanje (St. Martin's) */
export const seasonal = {
  title: { sl: 'Martinovanje', en: "St. Martin's menu" } as L10n,
  intro: {
    sl: 'V času martinovanja pripravljamo dva degustacijska menija. Pri 3-hodnem meniju izberete med dvema predjedema in glavnima jedema.',
    en: "For St. Martin's season we serve two tasting menus. With the 3-course menu you choose between two starters and two mains.",
  } as L10n,
  menus: [
    {
      title: { sl: '3-hodni meni', en: '3-course menu' },
      price: 29,
      courses: [
        { options: [
          { name: { sl: 'Kmečka terina, mango chutney', en: 'Farmhouse terrine, mango chutney' }, allergens: ['mustard', 'sulphites'] },
          { name: { sl: 'Bučna juha, bučna semena', en: 'Pumpkin soup, pumpkin seeds' }, allergens: ['lactose'] },
        ] },
        { options: [
          { name: { sl: 'Račja prsa, rdeče zelje, mlinci', en: 'Duck breast, red cabbage, mlinci flatbread' }, allergens: ['lactose', 'gluten', 'egg', 'sulphites'] },
          { name: { sl: 'File gofa, maslena omaka, ohrovt, koromač', en: 'Amberjack fillet, butter sauce, savoy cabbage, fennel' }, allergens: ['fish', 'sulphites', 'lactose'] },
        ] },
        { options: [
          { name: { sl: 'Čokoladni mousse, kaki, čokoladni drobljenec', en: 'Chocolate mousse, persimmon, chocolate crumble' }, allergens: ['lactose'] },
        ] },
      ],
    },
    {
      title: { sl: '5-hodni meni', en: '5-course menu' },
      price: 46,
      courses: [
        { options: [{ name: { sl: 'Kmečka terina, mango chutney', en: 'Farmhouse terrine, mango chutney' }, allergens: ['mustard', 'sulphites'] }] },
        { options: [{ name: { sl: 'Raviol, staran sir, buča, lešniki, gobe', en: 'Raviolo, aged cheese, pumpkin, hazelnuts, mushrooms' }, allergens: ['lactose', 'egg', 'gluten', 'nuts'] }] },
        { options: [{ name: { sl: 'Račja prsa, rdeče zelje, mlinci', en: 'Duck breast, red cabbage, mlinci flatbread' }, allergens: ['lactose', 'gluten', 'egg', 'sulphites'] }] },
        { options: [{ name: { sl: 'File gofa, maslena omaka, ohrovt, koromač', en: 'Amberjack fillet, butter sauce, savoy cabbage, fennel' }, allergens: ['fish', 'sulphites', 'lactose'] }] },
        { options: [{ name: { sl: 'Čokoladni mousse, kaki, čokoladni drobljenec', en: 'Chocolate mousse, persimmon, chocolate crumble' }, allergens: ['lactose'] }] },
      ],
    },
  ] satisfies SetMenu[],
};

/** Items shown on the home page teaser (featured ones, in this order). */
export const teaserItems: MenuItem[] = [...aLaCarte, ...weekly].filter((i) => i.featured);
