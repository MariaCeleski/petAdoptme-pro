/**
 * Admin Pet Routes - Phase 2
 * GET /api/admin/pets/pending - List pets pending approval
 * PATCH /api/admin/pets/:id/approve - Approve a pet
 * PATCH /api/admin/pets/:id/reject - Reject a pet
 */

import { Router } from 'express';
import * as adminPetController from '../../controllers/adminPetController.js';
import { asyncHandler } from '../../middleware/errorHandler.js';
import { sanitizeInputs, rateLimit } from '../../middleware/validation.js';
import { requireAuth, requireAdmin } from '../../middleware/auth.js';

const router = Router();

// All admin routes require authentication + admin role
router.use(requireAuth);
router.use(requireAdmin);

// Apply sanitization
router.use(sanitizeInputs);

// Apply rate limiting
router.use(rateLimit(60, 60000)); // 60 requests per minute for admin

/**
 * GET /api/admin/pets/pending
 * List all pets pending approval
 * Pagination: page, limit
 */
router.get('/pending', asyncHandler(adminPetController.listPendingPets));

/**
 * PATCH /api/admin/pets/:id/approve
 * Approve a pet for adoption
 * Sends confirmation email to owner
 */
router.patch('/:id/approve', asyncHandler(adminPetController.approvePet));

/**
 * PATCH /api/admin/pets/:id/reject
 * Reject a pet with reason
 * Sends rejection email to owner
 * Body: { reason: string }
 */
router.patch('/:id/reject', asyncHandler(adminPetController.rejectPet));

export default router;
