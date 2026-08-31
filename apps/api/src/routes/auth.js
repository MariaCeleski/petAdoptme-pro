/**
 * Authentication Routes
 * POST /api/auth/register - Register user
 * POST /api/auth/login - Login user
 * POST /api/auth/logout - Logout user
 * POST /api/auth/verify-email - Verify email
 * POST /api/auth/password-reset - Request password reset
 * POST /api/auth/password-reset/:token - Complete password reset
 * GET /api/auth/me - Get current user
 */

import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sanitizeInputs, rateLimit } from '../middleware/validation.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Apply sanitization to all routes
router.use(sanitizeInputs);

// Apply rate limiting
router.use(rateLimit(10, 60000)); // 10 requests per minute

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', asyncHandler(authController.register));

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', asyncHandler(authController.login));

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', requireAuth, asyncHandler(authController.logout));

/**
 * POST /api/auth/verify-email
 * Verify user email
 */
router.post('/verify-email', asyncHandler(authController.verifyEmail));

/**
 * POST /api/auth/password-reset
 * Request password reset
 */
router.post('/password-reset', asyncHandler(authController.requestPasswordReset));

/**
 * POST /api/auth/password-reset/:token
 * Complete password reset
 */
router.post('/password-reset/:token', asyncHandler(authController.resetPassword));

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', requireAuth, asyncHandler(authController.getCurrentUser));

export default router;
