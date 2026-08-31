/**
 * Adoption Routes
 * POST /api/adoptions - Create adoption request
 * GET /api/adoptions - List adoption requests
 * GET /api/adoptions/:id - Get adoption by ID
 * PATCH /api/adoptions/:id/approve - Approve adoption
 * PATCH /api/adoptions/:id/reject - Reject adoption
 * GET /api/adoptions/adopter/:adopterId - Get adoptions by adopter
 * GET /api/adoptions/pet/:petId - Get adoptions by pet
 */

import { Router } from 'express';
import * as adoptionController from '../controllers/adoptionController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sanitizeInputs, rateLimit } from '../middleware/validation.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Apply sanitization to all routes
router.use(sanitizeInputs);

// Apply rate limiting
router.use(rateLimit(20, 60000)); // 20 requests per minute

/**
 * POST /api/adoptions
 * Create an adoption request
 * Requires authentication
 */
router.post('/', requireAuth, asyncHandler(adoptionController.createAdoptionRequest));

/**
 * GET /api/adoptions
 * List adoption requests
 * Optional filters: status, petId, adopterId
 */
router.get('/', optionalAuth, asyncHandler(adoptionController.listAdoptions));

/**
 * GET /api/adoptions/:id
 * Get a single adoption request
 */
router.get('/:id', optionalAuth, asyncHandler(adoptionController.getAdoptionById));

/**
 * PATCH /api/adoptions/:id/approve
 * Approve an adoption request
 * Requires authentication (pet owner)
 */
router.patch('/:id/approve', requireAuth, asyncHandler(adoptionController.approveAdoption));

/**
 * PATCH /api/adoptions/:id/reject
 * Reject an adoption request
 * Requires authentication (pet owner)
 */
router.patch('/:id/reject', requireAuth, asyncHandler(adoptionController.rejectAdoption));

/**
 * GET /api/adoptions/adopter/:adopterId
 * Get all adoptions for a specific adopter
 */
router.get('/adopter/:adopterId', optionalAuth, asyncHandler(adoptionController.getAdoptionsByAdopter));

/**
 * GET /api/adoptions/pet/:petId
 * Get all adoption requests for a specific pet
 */
router.get('/pet/:petId', optionalAuth, asyncHandler(adoptionController.getAdoptionsByPet));

export default router;
