/**
 * Middleware de Rate Limiting para Next.js App Router
 * 
 * Uso em API routes:
 * import { withRateLimit } from '@/lib/rate-limiting/middleware';
 * 
 * export const POST = withRateLimit(
 *   async (req) => { ... },
 *   'auth' // tipo de rate limit
 * );
 * 
 * Requisitos: 12.2, 12.6
 */

import { NextResponse } from 'next/server';
import { rateLimiter, getClientIp, createRateLimitKey, RATE_LIMIT_CONFIGS } from './index.js';

/**
 * Middleware wrapper para aplicar rate limiting a uma rota
 */
export function withRateLimit(handler, limitType = 'general', keyExtractor = null) {
  return async (req, ...args) => {
    try {
      // Extrair identificador único do cliente
      let clientId;

      if (keyExtractor && typeof keyExtractor === 'function') {
        // Usar função customizada se fornecida
        clientId = await keyExtractor(req);
      } else {
        // Tentar usar ID do usuário autenticado, senão usar IP
        const url = new URL(req.url);
        clientId = url.searchParams.get('userId') || getClientIp(req);
      }

      // Criar chave de rate limit
      const key = createRateLimitKey(clientId);

      // Verificar rate limit
      const result = await rateLimiter.checkLimit(key, limitType);

      // Se excedeu o limite, retornar 429
      if (!result.success) {
        return NextResponse.json(
          {
            error: 'Muitas requisições. Tente novamente mais tarde.',
            code: 'RATE_LIMIT_EXCEEDED',
            retryAfter: result.retryAfter,
            resetAt: result.resetAt.toISOString(),
            limit: RATE_LIMIT_CONFIGS[limitType],
          },
          {
            status: 429,
            headers: {
              ...result.headers,
              'Retry-After': result.retryAfter.toString(),
              'Content-Type': 'application/json',
            },
          }
        );
      }

      // Chamar handler original
      const response = await handler(req, ...args);

      // Adicionar headers de rate limit à resposta
      if (response instanceof NextResponse) {
        Object.entries(result.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      }

      return response;
    } catch (error) {
      console.error('Rate limit middleware error:', error);
      
      // Em caso de erro, permitir requisição (fail-open)
      return handler(req, ...args);
    }
  };
}

/**
 * Middleware compatível com server middleware
 * Usar em middleware.js para proteção global
 */
export async function applyRateLimitHeaders(request, limitType = 'general') {
  try {
    const clientId = getClientIp(request);
    const key = createRateLimitKey(clientId);
    const result = await rateLimiter.checkLimit(key, limitType);

    if (!result.success) {
      return {
        blocked: true,
        response: NextResponse.json(
          {
            error: 'Muitas requisições. Tente novamente mais tarde.',
            code: 'RATE_LIMIT_EXCEEDED',
          },
          {
            status: 429,
            headers: {
              'Retry-After': result.retryAfter.toString(),
              ...result.headers,
            },
          }
        ),
      };
    }

    return {
      blocked: false,
      headers: result.headers,
    };
  } catch (error) {
    console.error('Rate limit headers error:', error);
    return {
      blocked: false,
      headers: {},
    };
  }
}

/**
 * Hook para usar em Server Components
 * Não usa verdadeiramente, mas oferece informações de status
 */
export async function checkRateLimitStatus(clientId, limitType = 'general') {
  return rateLimiter.getStatus(clientId, limitType);
}
