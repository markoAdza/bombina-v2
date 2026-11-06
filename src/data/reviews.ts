import type { Lang } from '../i18n/utils';

/** Guest reviews (source: Google reviews, as quoted on the previous website). */
export interface Review {
  author: string;
  /** language the review was written in */
  lang: Lang;
  text: string;
  /** translation shown on the other-language page (marked as translated) */
  translation?: string;
}

export const reviews: Review[] = [
  {
    author: 'Darjan Gantar',
    lang: 'sl',
    text: 'Odlična hrana in ambient. Edina restavracija z vrhunsko gurmansko kuhinjo v mestu Trbovlje.',
    translation: 'Excellent food and atmosphere. The only restaurant with truly gourmet cuisine in Trbovlje.',
  },
  {
    author: 'Metka Lukančič Nemec',
    lang: 'sl',
    text:
      'Obiskali smo nov bistro v Trbovljah in doživeli izjemno kulinarično izkušnjo. Hrana je bila vrhunska, pripravljena z najvišjim nivojem natančnosti in strasti. Vsaka jed je odražala vrhunske sestavine in premišljeno pripravo, kar nas je popolnoma navdušilo. Cene so povsem realne in primerne za kakovost, ki jo bistro ponuja. Še posebej nas je navdušilo, da je takšna odličnost prišla v Trbovlje, saj prinaša nekaj novega in drugačnega v naš kraj. Mladi kuhar je izjemno talentiran in očitno je, da je predan svoji umetnosti. Njegova partnerka v strežbi je prav tako izjemna, saj poskrbi za prijetno vzdušje in odlično postrežbo. Oba sta se izkazala za profesionalna in predana svojemu delu, kar se odraža v celotni izkušnji. Želimo jima vse najboljše na njuni začrtani poti. Brez dvoma se bomo še večkrat vrnili, saj je bistro postal naš novi najljubši kraj za uživanje v odlični hrani.',
    translation:
      'We visited a new bistro in Trbovlje and had an exceptional culinary experience. The food was superb, prepared with the highest level of precision and passion. Every dish reflected top ingredients and thoughtful preparation, which completely won us over. Prices are entirely fair for the quality on offer. We were especially delighted that such excellence has come to Trbovlje, bringing something new and different to our town. The young chef is exceptionally talented and clearly devoted to his craft. His partner, who runs the service, is just as remarkable, creating a lovely atmosphere and excellent service. Both proved to be professional and devoted to their work, and it shows in the whole experience. We wish them all the best on their journey. We will undoubtedly be back many times — the bistro has become our new favourite place for great food.',
  },
  {
    author: 'George Deriso',
    lang: 'en',
    text:
      'In 2024, I have dined in some of the best restaurants in many well-known foodie cities in the world — Tiranë Albania, Corfu Greece, Ljubljana Slovenia, Glasgow and Edinburgh Scotland, Paris France, Vienna Austria, Trieste Italy, London and Oxford England, Osaka Japan, and Sydney Australia. One of my best and most memorable dining experiences, however, was in Trbovlje Slovenia, where I was fortunate to have lunch at Bombina Bistro. There I had one of the finest gnocchi dishes I’ve ever had — handmade and lightly dressed in a creamy sauce that featured delicious locally-sourced wild mushrooms and served lovingly by the owner of the restaurant. The dish was preceded by a fresh local fish tartar in a light dressing, and perfectly complemented the gnocchi that followed. Bombina Bistro is a restaurant to watch and experience, as I’ve no doubt they will someday be awarded a Michelin star and help add Trbovlje to the list of the world’s great foodie cities.',
  },
  {
    author: 'Dijana Stojančič',
    lang: 'sl',
    text:
      'Prijetno okolje, fajn glasba, dobra hrana. Glavnih jedi nismo uspeli slikat, ker smo res napadli hrano. Cene primerne glede na kakovost hrane. Res super, da je v Zasavju takšen bistro. Sigurno se še vidmo!',
    translation:
      'Lovely setting, great music, good food. We didn’t manage to photograph the mains because we really dug in. Prices fair for the quality of the food. So great to have a bistro like this in Zasavje. We’ll definitely be back!',
  },
];
