/**
 * Secure API Route Handler Wrapper
 * 
 * Fornece wrapper para aplicar segurança, rate limiting e sanitização
 * a API routes de forma consistente
 * 
 * Uso:
 * import { secureApiHandler } from '@/lib/api/secure-handler';
 * 
 * export const GET = secureApiHandler(
 *   async (req) => { ... },
 *   { rateLimit: 'auth', requireAuth: true }
 * );
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth.js';
import { withRateLimit, getClientIp, createRateLimitKey, rateLimiter } from '@/lib/rate-limiting/index.js';
import { applyApiSecurityHeaders } from '@/lib/security/headers.js';
import { logApiEvent } from '@/lib/security/audit-logger.js';
import { sanitizeInput } from '@/lib/validation/sanitizers.js';
import { handleAPIError } from '@/lib/errors.js';

/**
 * Wrapper seguro para handlers de API
 */
export function secureApiHandler(handler, options = {}) {
  const {
    rateLimit = 'general',
    requireAuth = false,
    logEvent = true,
    sanitizeBody = true,
    validateInput = true,
  } = options;

  return async (req, ...args) => {
    try {
      // 1. Verificar autenticação se necessário
      if (requireAuth) {
        const session = await getServerSession(authOptions);
        if (!session) {
          const response = NextResponse.json(
            { error: 'Não autorizado', code: 'UNAUTHORIZED' },
            { status: 401 }
          );
          applyApiSecurityHeaders(response);
          return response;
        }
        // Adicionar sessão ao request para handler usar
        req.session = session;
      }

      // 2. Sanitizar corpo da requisição se for POST/PUT/PATCH
      if (sanitizeBody && ['POST', 'PUT', 'PATCH'].includes(req.method)) {
        try {
          const body = await req.json();
          const sanitized = sanitizeRequestBody(body);
          
          // Criar novo request com body sanitizado
          req = new Request(req, {
            body: JSON.stringify(sanitized),
          });
        } catch (error) {
          // Se não conseguir parsear JSON, deixar como está
        }
      }

      // 3. Log do evento
      if (logEvent) {
        await logApiEvent(req, {
          type: 'API_REQUEST',
          action: `${req.method} ${new URL(req.url).pathname}`,
          userId: req.session?.user?.id,
          email: req.session?.user?.email,
        });
      }

      // 4. Aplicar handler original
      let response = await handler(req, ...args);

      // 5. Aplicar security headers
      if (response instanceof NextResponse) {
        applyApiSecurityHeaders(response);
      }

      return response;
    } catch (error) {
      console.error('Secure handler error:', error);

      // Log do erro
      await logApiEvent(req, {
        type: 'API_ERROR',
        severity: 'ERROR',
        error: error.message,
      }).catch(() => {
        // Ignorar erros de logging
      });

      return handleAPIError(error);
    }
  };
}

/**
 * Versão com rate limiting aplicado
 */
export function secureApiHandlerWithRateLimit(handler, options = {}) {
  const { rateLimit = 'general', ...otherOptions } = options;

  // Aplicar rate limiting primeiro
  const withLimit = withRateLimit(
    secureApiHandler(handler, otherOptions),
    rateLimit
  );

  return withLimit;
}

/**
 * Sanitizar corpo da requisição recursivamente
 */
function sanitizeRequestBody(body, fieldTypes = {}) {
  if (!body || typeof body !== 'object') {
    return body;
  }

  if (Array.isArray(body)) {
    return body.map(item => sanitizeRequestBody(item, fieldTypes));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(body)) {
    const type = fieldTypes[key] || 'text';

    if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeInput(item, type) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeRequestBody(value, fieldTypes[key] || {});
    } else if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value, type);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Handlers específicos com configurações pré-definidas
 */

// Auth API - proteção máxima
export function authApiHandler(handler) {
  return secureApiHandlerWithRateLimit(handler, {
    rateLimit: 'auth',
    sanitizeBody: true,
    validateInput: true,
  });
}

// Upload API - proteção alta
export function uploadApiHandler(handler) {
  return secureApiHandlerWithRateLimit(handler, {
    rateLimit: 'upload',
    requireAuth: true,
    sanitizeBody: false, // FormData não precisa sanitização
    logEvent: true,
  });
}

// Pet CRUD API - proteção média
export function petApiHandler(handler, requireAuth = true) {
  return secureApiHandlerWithRateLimit(handler, {
    rateLimit: 'petCreate',
    requireAuth,
    sanitizeBody: true,
    logEvent: true,
  });
}

// Adoption API - proteção alta
export function adoptionApiHandler(handler) {
  return secureApiHandlerWithRateLimit(handler, {
    rateLimit: 'adoption',
    requireAuth: true,
    sanitizeBody: true,
    logEvent: true,
  });
}

// Public GET API - proteção baixa mas com rate limit
export function publicGetApiHandler(handler) {
  return secureApiHandlerWithRateLimit(handler, {
    rateLimit: 'publicGet',
    requireAuth: false,
    sanitizeBody: false,
    logEvent: false,
  });
}
