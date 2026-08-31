/**
 * Validation Middleware
 * Validates incoming request data against Zod schemas
 */

import { ApiError } from './errorHandler.js';

/**
 * Create a validation middleware
 * @param {Object} schema - Zod schema to validate against
 * @param {string} source - Where to validate ('body', 'query', 'params')
 */
export function validate(schema, source = 'body') {
  return async (req, res, next) => {
    try {
      const data = req[source];
      const result = await schema.parseAsync(data);
      
      // Replace with validated data
      req[source] = result;
      next();
    } catch (error) {
      if (error.name === 'ZodError') {
        const details = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
          code: e.code,
        }));
        
        throw new ApiError(
          'Validation failed',
          400,
          'VALIDATION_ERROR'
        );
      }
      next(error);
    }
  };
}

/**
 * Input sanitization middleware
 * Removes potentially harmful characters from string inputs
 */
export function sanitizeInputs(req, res, next) {
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      // Remove HTML tags and trim
      return obj.replace(/<[^>]*>/g, '').trim();
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    if (obj !== null && typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = sanitize(value);
      }
      return sanitized;
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
}

/**
 * Rate limiting middleware (basic in-memory implementation)
 * For production, use external service like Upstash
 */
const requestCounts = new Map();

export function rateLimit(maxRequests = 100, windowMs = 60000) {
  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    
    if (!requestCounts.has(key)) {
      requestCounts.set(key, []);
    }
    
    const requests = requestCounts.get(key);
    const recentRequests = requests.filter(time => now - time < windowMs);
    
    if (recentRequests.length >= maxRequests) {
      res.set('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({
        error: 'Too Many Requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil(windowMs / 1000),
        timestamp: new Date().toISOString(),
      });
    }
    
    recentRequests.push(now);
    requestCounts.set(key, recentRequests);
    next();
  };
}
