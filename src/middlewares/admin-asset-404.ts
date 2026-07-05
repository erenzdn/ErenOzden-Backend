import path from 'path';
import type { Core } from '@strapi/strapi';

const ASSET_EXTENSIONS = new Set(['.js', '.css', '.map', '.woff', '.woff2', '.ico', '.svg']);

export default (_config: unknown, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx: { path: string; status: number; body: unknown; type: string; response: { get: (name: string) => string | undefined } }, next: () => Promise<void>) => {
    await next();

    const adminPath = strapi.config.admin.path;
    if (!ctx.path.startsWith(adminPath)) {
      return;
    }

    const ext = path.extname(ctx.path);
    if (!ASSET_EXTENSIONS.has(ext)) {
      return;
    }

    const contentType = ctx.response.get('content-type') ?? '';
    if (contentType.includes('text/html')) {
      ctx.status = 404;
      ctx.type = 'text/plain';
      ctx.body = 'Not Found';
    }
  };
};
