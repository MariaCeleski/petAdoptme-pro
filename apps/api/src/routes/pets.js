/**
 * Pet Routes
 * GET /api/pets - List all pets
 * GET /api/pets/:id - Get pet by ID
 * POST /api/pets - Create pet (with photo upload)
 * PATCH /api/pets/:id - Update pet
 * DELETE /api/pets/:id - Delete/archive pet
 * PATCH /api/pets/:id/status - Update pet status
 * GET /api/pets/owner/:ownerId - Get pets by owner
 * POST /api/pets/:id/pet-compatibility - Save compatibility info
 */

import { Router } from 'express';
import * as petController from '../controllers/petController.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { sanitizeInputs, rateLimit } from '../middleware/validation.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import upload from '../middleware/upload.middleware.js';

const router = Router();

// Apply sanitization to all routes
router.use(sanitizeInputs);

// Apply rate limiting
router.use(rateLimit(30, 60000)); // 30 requests per minute

/**
 * GET /api/pets
 * List all available pets with filters and pagination
 */
router.get('/', optionalAuth, asyncHandler(petController.listPets));

/**
 * GET /api/pets/:id
 * Get a single pet by ID
 */
router.get('/:id', optionalAuth, asyncHandler(petController.getPetById));

/**
 * POST /api/pets
 * Create a new pet with photo upload
 * Requires authentication (INDIVIDUAL_OWNER or SHELTER_ADMIN)
 * Accepts FormData multipart with up to 5 photos
 */
router.post('/', requireAuth, upload.array('photos', 5), asyncHandler(petController.createPet));

/**
 * PATCH /api/pets/:id
 * Update a pet with optional photo update
 * Requires authentication (owner)
 */
router.patch('/:id', requireAuth, upload.array('photos', 5), asyncHandler(petController.updatePet));

/**
 * DELETE /api/pets/:id
 * Archive/delete a pet
 * Requires authentication (owner)
 */
router.delete('/:id', requireAuth, asyncHandler(petController.deletePet));

/**
 * PATCH /api/pets/:id/status
 * Update pet status
 * Requires authentication (owner)
 */
router.patch('/:id/status', requireAuth, asyncHandler(petController.updatePetStatus));

/**
 * GET /api/pets/owner/:ownerId
 * Get all pets owned by a user
 */
router.get('/owner/:ownerId', optionalAuth, asyncHandler(petController.getPetsByOwner));

/**
 * POST /api/pets/:id/pet-compatibility
 * Save or update pet compatibility information
 * Requires authentication (owner)
 */
router.post('/:id/pet-compatibility', requireAuth, asyncHandler(petController.savePetCompatibility));

/**
 * DELETE /api/pets/:id/pet-compatibility
 * Delete pet compatibility information
 * Requires authentication (owner)
 */
router.delete('/:id/pet-compatibility', requireAuth, asyncHandler(petController.deletePetCompatibility));

export default router;
