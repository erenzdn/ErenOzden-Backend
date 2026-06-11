import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Plugin => ({
  // Internationalization (i18n) Plugin
  i18n: {
    enabled: true,
    config: {
      defaultLocale: 'tr',
      locales: ['tr', 'en'],
    },
  },
});

export default config;
