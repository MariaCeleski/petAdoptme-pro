/**
 * Error Handler Middleware
 * Centralized error handling for API responses
 */

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Error handler middleware
 * Must be the last middleware defined
 */
export function errorHandler(err, req, res, next) {
  console.error('Error:', {
    message: err.message,
    code: err.code,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    details: err.details,
  });

  // Validation errors from Zod
  if (err.name === 'ZodError' || (err.message && err.message.startsWith('['))) {
    let errors = [];
    try {
      // If err.errors is an array, use it directly
      if (Array.isArray(err.errors)) {
        errors = err.errors.map(e => ({
          field: Array.isArray(e.path) ? e.path.join('.') : e.path,
          message: e.message,
        }));
      } else if (typeof err.message === 'string' && err.message.startsWith('[')) {
        // If it's a JSON string, parse it
        errors = JSON.parse(err.message).map(e => ({
          field: Array.isArray(e.path) ? e.path.join('.') : e.path,
          message: e.message,
        }));
      }
    } catch (parseErr) {
      console.error('Error parsing validation errors:', parseErr);
      errors = [{ field: 'unknown', message: 'Validation error' }];
    }
    return res.status(400).json({
      error: 'Validation Error',
      code: 'VALIDATION_ERROR',
      details: errors,
      timestamp: new Date().toISOString(),
    });
  }

  // Custom API errors
  if (err instanceof ApiError) {
    const response = {
      error: err.message,
      code: err.code,
      timestamp: err.timestamp,
    };
    
    if (err.details) {
      response.details = err.details;
    }
    
    return res.status(err.statusCode).json(response);
  }

  // Supabase errors
  if (err.message && err.message.includes('PGRST')) {
    return res.status(500).json({
      error: 'Database Error',
      code: 'DATABASE_ERROR',
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { details: err.message }),
    });
  }

  // Generic error response
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
