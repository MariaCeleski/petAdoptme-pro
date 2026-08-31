/**
 * Authentication Middleware
 * Validates JWT tokens and extracts user information
 */

import { ApiError } from './errorHandler.js';

/**
 * Mock JWT verification (replace with real JWT library in production)
 * In production, use jsonwebtoken or similar library
 */
export function verifyToken(token) {
  try {
    // This is a placeholder - in production use jwt.verify()
    if (!token || token === 'invalid') {
      return null;
    }
    // Decode the token (simplified)
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    return JSON.parse(Buffer.from(parts[1], 'base64').toString());
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
 * @param {string} role - Role to require ('ADOPTER', 'SHELTER_ADMIN', 'INDIVIDUAL_OWNER')
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

    if (req.user.role !== role && !Array.isArray(role)) {
      throw new ApiError(
        `This action requires ${role} role`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    if (Array.isArray(role) && !role.includes(req.user.role)) {
      throw new ApiError(
        `This action requires one of: ${role.join(', ')}`,
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    next();
  };
}
