import type { Core } from '@strapi/strapi';

const config = ({ env }: Core.Config.Shared.ConfigParams): Core.Config.Admin => ({
  url: env('ADMIN_URL', 'https://yonetimpaneli.mehmeterenozden.com/admin'),
  serveAdminPanel: env.bool('SERVE_ADMIN', true),
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    options: {
      expiresIn: env('ADMIN_JWT_EXPIRES_IN', '7d'),
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  forgotPassword: {
    from: env('ADMIN_FORGOT_PASSWORD_FROM', 'no-reply@mehmeterenozden.com'),
    replyTo: env('ADMIN_FORGOT_PASSWORD_REPLY_TO', 'info@mehmeterenozden.com'),
  },
  rateLimit: {
    enabled: true,
    interval: 60000,
    max: 5,
  },
  flags: {
    nps: env.bool('FLAG_NPS', false),
    promoteEE: env.bool('FLAG_PROMOTE_EE', false),
  },
  watchIgnoreFiles: [
    '**/config/sync/**',
  ],
});

export default config;
