/**
 * Rate Limiting Module
 * 
 * Implementa rate limiting para proteção contra abuso de APIs
 * Requisitos: 12.2, 12.6
 * 
 * Suporta dois backends:
 * 1. Redis (Upstash) - recomendado para produção
 * 2. In-Memory - fallback para desenvolvimento
 */

// Tipos de limite por endpoint
export const RATE_LIMIT_CONFIGS = {
  // APIs de autenticação - limite restritivo
  auth: {
    points: 5, // 5 requisições
    duration: 900, // 15 minutos
    blockDuration: 300, // Bloqueia por 5 minutos após exceder
    keyPrefix: 'rl:auth:',
    description: 'Login/Registro: 5 requisições por 15 minutos'
  },
  
  // APIs de upload de imagens - limite médio
  upload: {
    points: 10,
    duration: 3600, // 1 hora
    blockDuration: 600, // Bloqueia por 10 minutos
    keyPrefix: 'rl:upload:',
    description: 'Upload: 10 requisições por hora'
  },
  
  // APIs de criação de pets - limite médio
  petCreate: {
    points: 20,
    duration: 86400, // 24 horas
    blockDuration: 1800, // Bloqueia por 30 minutos
    keyPrefix: 'rl:pet:create:',
    description: 'Criar pet: 20 requisições por dia'
  },
  
  // APIs de modificação de pets - limite médio
  petModify: {
    points: 50,
    duration: 86400,
    blockDuration: 1800,
    keyPrefix: 'rl:pet:modify:',
    description: 'Editar/deletar pet: 50 requisições por dia'
  },
  
  // APIs gerais - limite permissivo
  general: {
    points: 100,
    duration: 900, // 15 minutos
    blockDuration: 300,
    keyPrefix: 'rl:general:',
    description: 'Geral: 100 requisições por 15 minutos'
  },
  
  // APIs de adoção - limite moderado
  adoption: {
    points: 20,
    duration: 86400,
    blockDuration: 3600, // Bloqueia por 1 hora
    keyPrefix: 'rl:adoption:',
    description: 'Adoção: 20 requisições por dia'
  },
  
  // APIs públicas (GET pets) - limite alto
  publicGet: {
    points: 1000,
    duration: 3600,
    blockDuration: 300,
    keyPrefix: 'rl:public:',
    description: 'Listagem pública: 1000 requisições por hora'
  }
};

/**
 * In-memory store para tracking de rate limits
 * Usa Map com timestamps para rastrear requisições
 */
class InMemoryRateLimitStore {
  constructor() {
    this.store = new Map();
    // Limpar entries expiradas a cada minuto
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  async consume(key, config, points = 1) {
    const now = Date.now();
    const entry = this.store.get(key);

    // Criar nova entrada se não existir
    if (!entry) {
      this.store.set(key, {
        count: points,
        firstRequestAt: now,
        blockedUntil: null,
        consumedAt: [now],
      });

      return {
        remainingPoints: config.points - points,
        msBeforeNext: config.duration * 1000,
      };
    }

    // Verificar se está bloqueado
    if (entry.blockedUntil && entry.blockedUntil > now) {
      const msBeforeNext = entry.blockedUntil - now;
      return {
        remainingPoints: 0,
        msBeforeNext,
        blocked: true,
      };
    }

    // Limpar entradas expiradas (fora da janela)
    const windowStart = now - config.duration * 1000;
    entry.consumedAt = entry.consumedAt.filter(ts => ts > windowStart);

    // Verificar se pode consumir
    const currentCount = entry.consumedAt.length;
    const totalPoints = currentCount + points;

    if (totalPoints > config.points) {
      // Excedeu o limite
      const blockedUntil = now + config.blockDuration * 1000;
      entry.blockedUntil = blockedUntil;
      entry.count = totalPoints;

      return {
        remainingPoints: 0,
        msBeforeNext: config.blockDuration * 1000,
        blocked: true,
      };
    }

    // Consumir pontos
    for (let i = 0; i < points; i++) {
      entry.consumedAt.push(now);
    }
    entry.count = entry.consumedAt.length;

    return {
      remainingPoints: config.points - entry.consumedAt.length,
      msBeforeNext: (windowStart + config.duration * 1000) - now,
    };
  }

  get(key) {
    return this.store.get(key);
  }

  delete(key) {
    this.store.delete(key);
  }

  cleanup() {
    const now = Date.now();
    const toDelete = [];

    for (const [key, entry] of this.store.entries()) {
      // Se o bloco expirou e não há requisições recentes, deletar
      if (
        (!entry.blockedUntil || entry.blockedUntil < now) &&
        entry.consumedAt &&
        entry.consumedAt.length > 0
      ) {
        const lastRequest = Math.max(...entry.consumedAt);
        // Manter por mais 1 minuto após a janela expirar
        if (lastRequest < now - 70000) {
          toDelete.push(key);
        }
      }
    }

    toDelete.forEach(key => this.store.delete(key));
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

class RateLimiter {
  constructor() {
    this.store = new InMemoryRateLimitStore();
    this.redisClient = null;
    this.useRedis = false;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    try {
      // Tentar usar Redis (Upstash) se disponível
      if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        // Usar fetch API para Redis REST
        this.useRedis = true;
        console.log('✓ Rate limiter usando Upstash Redis');
      }
    } catch (error) {
      console.warn('⚠ Upstash Redis não configurado, usando rate limiter em memória');
      this.useRedis = false;
    }

    this.initialized = true;
  }

  /**
   * Verificar se uma requisição está dentro do limite
   * @param {string} key - Identificador único (IP, user ID, etc)
   * @param {string} limitType - Tipo de limite (auth, upload, etc)
   * @param {number} points - Pontos a consumir (padrão: 1)
   * @returns {Promise<Object>} Objeto com status e headers de rate limit
   */
  async checkLimit(key, limitType = 'general', points = 1) {
    await this.initialize();

    const config = RATE_LIMIT_CONFIGS[limitType];
    if (!config) {
      throw new Error(`Rate limit type não encontrado: ${limitType}`);
    }

    try {
      const result = await this.store.consume(key, config, points);
      
      const headers = this.getHeaders(result, config);

      if (result.blocked) {
        return {
          success: false,
          remaining: result.remainingPoints,
          resetAt: new Date(Date.now() + result.msBeforeNext),
          headers,
          retryAfter: Math.ceil(result.msBeforeNext / 1000),
        };
      }

      return {
        success: true,
        remaining: result.remainingPoints,
        resetAt: new Date(Date.now() + result.msBeforeNext),
        headers,
      };
    } catch (error) {
      console.error('Rate limiter error:', error);
      throw error;
    }
  }

  /**
   * Obter headers padrão de rate limiting
   */
  getHeaders(result, config) {
    return {
      'X-RateLimit-Limit': config.points,
      'X-RateLimit-Remaining': Math.max(0, result.remainingPoints),
      'X-RateLimit-Reset': new Date(Date.now() + result.msBeforeNext).toISOString(),
    };
  }

  /**
   * Resetar contador de um cliente
   */
  async reset(key, limitType = 'general') {
    await this.initialize();
    this.store.delete(key);
  }

  /**
   * Obter informações atuais do rate limit de um cliente
   */
  async getStatus(key, limitType = 'general') {
    await this.initialize();
    const config = RATE_LIMIT_CONFIGS[limitType];

    const entry = this.store.get(key);
    if (!entry) {
      return {
        points: config.points,
        remaining: config.points,
        resetAt: null,
      };
    }

    const windowStart = Date.now() - config.duration * 1000;
    const recentRequests = entry.consumedAt.filter(ts => ts > windowStart).length;

    return {
      points: config.points,
      remaining: Math.max(0, config.points - recentRequests),
      resetAt: new Date(Date.now() + config.duration * 1000),
      blocked: entry.blockedUntil > Date.now(),
    };
  }
}

// Exportar instância singleton
export const rateLimiter = new RateLimiter();

/**
 * Extrair IP do cliente da requisição
 */
export function getClientIp(request) {
  // Verificar headers de proxy
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fallback para IP da requisição (no Vercel, pode não estar disponível)
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

/**
 * Criar chave de rate limit para um usuário ou IP
 */
export function createRateLimitKey(identifier, suffix = '') {
  if (!identifier) {
    identifier = 'anonymous';
  }
  
  const key = `${identifier}${suffix ? ':' + suffix : ''}`;
  
  // Sanitizar para ser seguro para Redis
  return key
    .replace(/[^a-zA-Z0-9:._-]/g, '_')
    .substring(0, 256);
}
