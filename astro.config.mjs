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
});
