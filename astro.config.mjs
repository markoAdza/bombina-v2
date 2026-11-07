// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.bistrobombina.com',
  trailingSlash: 'ignore',
  i18n: {
    locales: ['sl', 'en'],
    defaultLocale: 'sl',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: { defaultLocale: 'sl', locales: { sl: 'sl-SI', en: 'en-GB' } },
      filter: (page) => !page.includes('/404'),
    }),
  ],
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
  vite: {
    // motion.ts is lazy-loaded, so Vite would only discover these deps on first visit and
    // re-optimise mid-session (504 "Outdated Optimize Dep" → motion fails → no scroll reveals).
    optimizeDeps: {
      include: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'lenis'],
    },
  },
});
