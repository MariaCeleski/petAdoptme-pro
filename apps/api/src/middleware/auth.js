/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user information
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ApiError } from './errorHandler.js';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '24h';

/**
 * Generate JWT token
 * @param {Object} payload - Data to encode in token
 * @returns {string} JWT token
 */
export function generateToken(payload) {
  try {
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
      algorithm: 'HS256',
    });
    return token;
  } catch (error) {
    console.error('Error generating token:', error);
    throw new ApiError('Failed to generate token', 500, 'TOKEN_GENERATION_FAILED');
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
    });

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn('Token expired');
      return null;
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.warn('Invalid token');
      return null;
    } else if (error instanceof jwt.NotBeforeError) {
      console.warn('Token not yet valid');
      return null;
    }
    return null;
  }
}

/**
 * Decode token without verifying signature (for debugging)
 * Use with caution - only for development
 */
export function decodeToken(token) {
  try {
    if (!token) {
      return null;
    }
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

/**
 * Require authentication middleware
 * Validates that request has a valid JWT token
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new ApiError(
      'Missing authorization header',
      401,
      'MISSING_TOKEN'
    );
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  const decoded = verifyToken(token);

  if (!decoded || !decoded.userId) {
    throw new ApiError(
      'Invalid or expired token',
      401,
      'INVALID_TOKEN'
    );
  }

  req.user = decoded;
  next();
}

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if token is missing
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    const decoded = verifyToken(token);
    if (decoded && decoded.userId) {
      req.user = decoded;
    }
  }

  next();
}

/**
 * Require specific user role
 * @param {string|string[]} role - Role(s) to require ('ADOPTER', 'SHELTER_ADMIN', 'INDIVIDUAL_OWNER')
 */
export function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        401,
        'AUTHENTICATION_REQUIRED'
      );
    }

    // Support both single role and array of roles
    const roles = Array.isArray(role) ? role : [role];

    if (!roles.includes(req.user.role)) {
      throw new ApiError(
        `This action requires one of these roles: ${roles.join(', ')}`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
}

/**
 * Refresh token helper
 * Generates new token with extended expiry
 */
export function refreshToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new ApiError(
      'Missing authorization header',
      401,
      'MISSING_TOKEN'
    );
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  const decoded = decodeToken(token);

  if (!decoded || !decoded.userId) {
    throw new ApiError(
      'Invalid token',
      401,
      'INVALID_TOKEN'
    );
  }

  // Remove expiration from payload before refreshing
  const { exp, iat, ...payload } = decoded;

  const newToken = generateToken(payload);
  req.newToken = newToken;

  next();
}
