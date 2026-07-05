/**
 * message controller
 */

import { factories } from '@strapi/strapi';
import type { Core } from '@strapi/strapi';

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

interface CreateRequestBody {
  data?: {
    cfTurnstileToken?: string;
    [key: string]: unknown;
  };
}

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

async function verifyTurnstileToken(
  token: string,
  secretKey: string,
  remoteIp?: string
): Promise<TurnstileVerifyResponse> {
  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
  formData.append('response', token);

  if (remoteIp) {
    formData.append('remoteip', remoteIp);
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error(`Turnstile API yanıt vermedi: ${response.status}`);
  }

  return response.json() as Promise<TurnstileVerifyResponse>;
}

function getClientIp(ctx: { request: { headers: Record<string, string | string[] | undefined>; ip?: string } }): string | undefined {
  const xForwardedFor = ctx.request.headers['x-forwarded-for'];
  if (typeof xForwardedFor === 'string') {
    return xForwardedFor.split(',')[0]?.trim();
  }
  const xRealIp = ctx.request.headers['x-real-ip'];
  if (typeof xRealIp === 'string') {
    return xRealIp;
  }
  return ctx.request.ip;
}

export default factories.createCoreController('api::message.message', ({ strapi }) => ({
  async create(ctx) {
    const body = ctx.request.body as CreateRequestBody;
    const data = body?.data;

    if (!data?.cfTurnstileToken) {
      return ctx.badRequest('Güvenlik token\'ı eksik. Lütfen formu yeniden gönderin.');
    }

    const secretKey = process.env.TURNSTILE_SECRET_KEY;
    if (!secretKey) {
      strapi.log.error('TURNSTILE_SECRET_KEY ortam değişkeni tanımlı değil');
      return ctx.internalServerError('Sunucu yapılandırma hatası');
    }

    const cfTurnstileToken = data.cfTurnstileToken;
    const clientIp = getClientIp(ctx);

    try {
      const cfResult = await verifyTurnstileToken(cfTurnstileToken, secretKey, clientIp);

      if (!cfResult.success) {
        strapi.log.warn('Turnstile doğrulaması başarısız', {
          errorCodes: cfResult['error-codes'],
          clientIp,
        });
        return ctx.badRequest('Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin.');
      }

      delete data.cfTurnstileToken;

      strapi.log.info('Turnstile doğrulaması başarılı, mesaj kaydediliyor', {
        clientIp,
        hostname: cfResult.hostname,
      });

      return await super.create(ctx);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      strapi.log.error('Turnstile doğrulama hatası', {
        error: errorMessage,
        clientIp,
      });
      return ctx.internalServerError('Güvenlik doğrulaması sırasında bir hata oluştu');
    }
  },
}));
