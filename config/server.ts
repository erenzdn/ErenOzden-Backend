import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Server => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1338),
  url: env('PUBLIC_URL', 'https://api.mehmeterenozden.com'),
  proxy: {
    koa: env.bool('IS_PROXIED', true),
  },
  app: {
    keys: env.array('APP_KEYS'),
  },
  dirs: {
    public: './public',
  },
  cron: {
    enabled: env.bool('CRON_ENABLED', false),
  },
});

export default config;
