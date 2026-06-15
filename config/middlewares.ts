import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Middlewares => [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': [
            "'self'",
            'https:',
            'https://api.mehmeterenozden.com',
            'https://yonetimpaneli.mehmeterenozden.com',
          ],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https://api.mehmeterenozden.com',
            'https://yonetimpaneli.mehmeterenozden.com',
            'market-assets.strapi.io',
            'dl.airtable.com',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'https://api.mehmeterenozden.com',
            'market-assets.strapi.io',
            'dl.airtable.com',
          ],
          'frame-ancestors': [
            "'self'",
            'https://yonetimpaneli.mehmeterenozden.com',
          ],
          upgradeInsecureRequests: null,
        },
      },
      frameguard: {
        action: 'sameorigin',
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      xssFilter: true,
      noSniff: true,
      referrerPolicy: {
        policy: 'strict-origin-when-cross-origin',
      },
      permittedCrossDomainPolicies: false,
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
        'X-Requested-With',
        'Cache-Control',
      ],
      origin: env(
        'CORS_ORIGINS',
        'https://mehmeterenozden.com,https://www.mehmeterenozden.com,https://api.mehmeterenozden.com,https://yonetimpaneli.mehmeterenozden.com'
      ).split(','),
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      credentials: true,
      keepHeaderOnError: true,
      maxAge: 86400,
    },
  },
  {
    name: 'strapi::poweredBy',
    config: {
      poweredBy: 'Strapi',
    },
  },
  'strapi::query',
  {
    name: 'strapi::body',
    config: {
      formLimit: '10mb',
      jsonLimit: '10mb',
      textLimit: '10mb',
      formidable: {
        maxFileSize: 50 * 1024 * 1024,
      },
    },
  },
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
