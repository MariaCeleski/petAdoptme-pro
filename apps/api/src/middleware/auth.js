/**
 * Authentication Middleware
 * Handles JWT token generation, verification, and user authorization
 * Uses jsonwebtoken for secure token-based authentication
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ApiError } from './errorHandler.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production-2024';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * Generate JWT access token
 * @param {Object} payload - Data to encode (userId, email, role, etc)
 * @returns {string} JWT token
 * @throws {Error} If token generation fails
 */
export function generateToken(payload) {
  try {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be an object');
    }

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256',
      issuer: 'petadopt-api',
      audience: 'petadopt-clients',
    });

    return token;
  } catch (error) {
    console.error('Error generating token:', error.message);
    throw new ApiError('Failed to generate token', 500, 'TOKEN_GENERATION_ERROR');
  }
}

/**
 * Generate JWT refresh token (longer expiry for token renewal)
 * @param {Object} payload - Data to encode
 * @returns {string} Refresh token
 */
export function generateRefreshToken(payload) {
  try {
    const refreshToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      algorithm: 'HS256',
      issuer: 'petadopt-api',
      audience: 'petadopt-refresh',
    });

    return refreshToken;
  } catch (error) {
    console.error('Error generating refresh token:', error.message);
    throw new ApiError('Failed to generate refresh token', 500, 'REFRESH_TOKEN_ERROR');
  }
}

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded token data or null if invalid
 */
export function verifyToken(token) {
  try {
    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'petadopt-api',
      audience: 'petadopt-clients',
    });

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Token expired:', error.message);
      return null;
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid token:', error.message);
      return null;
    } else if (error instanceof jwt.NotBeforeError) {
      console.warn('Token not yet valid:', error.message);
      return null;
    } else {
      console.error('Token verification error:', error.message);
      return null;
    }
  }
}

/**
 * Verify refresh token
 * @param {string} refreshToken - Refresh token to verify
 * @returns {Object|null} Decoded refresh token data or null if invalid
 */
export function verifyRefreshToken(refreshToken) {
  try {
    if (!refreshToken) {
      return null;
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET, {
      algorithms: ['HS256'],
      issuer: 'petadopt-api',
      audience: 'petadopt-refresh',
    });

    return decoded;
  } catch (error) {
    console.warn('Refresh token verification failed:', error.message);
    return null;
  }
}

/**
 * Decode token without verifying signature (for debugging only)
 * ⚠️ Use with caution - only for development
 */
export function decodeToken(token) {
  try {
    if (!token) {
      return null;
    }
    return jwt.decode(token);
  } catch (error) {
    console.error('Error decoding token:', error.message);
    return null;
  }
}

/**
 * Get token from Authorization header
 * Expects: "Bearer <token>"
 * @param {string} authHeader - Authorization header value
 * @returns {string|null} Token or null if invalid format
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0].toLowerCase() === 'bearer') {
    return parts[1];
  }

  return null;
}

/**
 * Require authentication middleware
 * Validates that request has a valid JWT token
 * Throws ApiError if not authenticated
 */
export function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(
        'Cabeçalho de autorização ausente',
        401,
        'MISSING_TOKEN'
      );
    }

    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      throw new ApiError(
        'Formato de token inválido. Use: Authorization: Bearer <token>',
        401,
        'INVALID_TOKEN_FORMAT'
      );
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      throw new ApiError(
        'Token inválido ou expirado',
        401,
        'INVALID_TOKEN'
      );
    }

    // Attach user info to request
    req.user = decoded;
    req.token = token;

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if token is missing
 * req.user will be set if token is valid, undefined otherwise
 */
export function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return next();
    }

    const decoded = verifyToken(token);

    if (decoded && decoded.userId) {
      req.user = decoded;
      req.token = token;
    }

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Require specific user role(s)
 * Can check single role or multiple roles
 * @param {string|string[]} requiredRoles - Role(s) to require
 * @returns {Function} Middleware function
 */
export function requireRole(requiredRoles) {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(
          'Autenticação obrigatória',
          401,
          'AUTHENTICATION_REQUIRED'
        );
      }

      const userRole = req.user.role || req.user.userType;
      const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (!roles.includes(userRole)) {
        throw new ApiError(
          `Requer uma destas roles: ${roles.join(', ')}`,
          403,
          'INSUFFICIENT_PERMISSIONS'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Require admin role
 * Shorthand for requireRole(['ADMIN', 'SHELTER_ADMIN'])
 */
export function requireAdmin(req, res, next) {
  return requireRole(['ADMIN', 'SHELTER_ADMIN'])(req, res, next);
}

/**
 * Get token expiration time
 * @param {string} token - JWT token
 * @returns {number|null} Expiration timestamp in milliseconds or null
 */
export function getTokenExpiration(token) {
  try {
    const decoded = decodeToken(token);
    if (decoded && decoded.exp) {
      return decoded.exp * 1000; // Convert to milliseconds
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Check if token is expired
 * @param {string} token - JWT token
 * @returns {boolean} True if token is expired
 */
export function isTokenExpired(token) {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    return Date.now() >= decoded.exp * 1000;
  } catch (error) {
    return true;
  }
}

/**
 * Get time until token expiration
 * @param {string} token - JWT token
 * @returns {number|null} Milliseconds until expiration or null if invalid
 */
export function getTimeUntilExpiration(token) {
  try {
    const expiration = getTokenExpiration(token);
    if (!expiration) {
      return null;
    }
    const timeLeft = expiration - Date.now();
    return Math.max(0, timeLeft);
  } catch (error) {
    return null;
  }
}
