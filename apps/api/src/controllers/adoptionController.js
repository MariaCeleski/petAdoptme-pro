/**
 * Adoption Controller
 * Handles adoption request workflow
 */

import { ApiError } from '../middleware/errorHandler.js';
import { insert, select, update } from '../services/supabaseClient.js';
import { adoptionCreateSchema } from '@petadopt/shared';

/**
 * POST /api/adoptions
 * Create an adoption request
 * Requires: ADOPTER role
 */
export async function createAdoptionRequest(req, res, next) {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    const adoptionData = await adoptionCreateSchema.parseAsync(req.body);

    // Check if pet exists
    const pets = await select('pets', { id: adoptionData.petId });
    if (!pets || pets.length === 0) {
      throw new ApiError(
        'Pet not found',
        404,
        'PET_NOT_FOUND'
      );
    }

    const pet = pets[0];

    // Check if pet is available
    if (pet.pet_status !== 'AVAILABLE') {
      throw new ApiError(
        `Pet is not available for adoption (status: ${pet.pet_status})`,
        400,
        'PET_NOT_AVAILABLE'
      );
    }

    // Create adoption request
    const newAdoption = await insert('adoptions', {
      ...adoptionData,
      pet_id: adoptionData.petId,
      adopter_id: req.user.userId,
      adoption_status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (!newAdoption || newAdoption.length === 0) {
      throw new ApiError(
        'Failed to create adoption request',
        500,
        'ADOPTION_CREATION_FAILED'
      );
    }

    res.status(201).json({
      message: 'Adoption request created successfully',
      data: newAdoption[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/adoptions
 * Get adoption requests
 * Optional: Filter by status, pet_id, adopter_id
 */
export async function listAdoptions(req, res, next) {
  try {
    const { status, petId, adopterId, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) filter.adoption_status = status;
    if (petId) filter.pet_id = petId;
    if (adopterId) filter.adopter_id = adopterId;

    // Get adoptions
    const adoptions = await select('adoptions', filter);
    const totalCount = adoptions.length;

    const paginatedAdoptions = adoptions.slice(offset, offset + limit);

    res.status(200).json({
      data: paginatedAdoptions,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/adoptions/:id
 * Get a single adoption request
 */
export async function getAdoptionById(req, res, next) {
  try {
    const { id } = req.params;

    const adoptions = await select('adoptions', { id });
    if (!adoptions || adoptions.length === 0) {
      throw new ApiError(
        'Adoption request not found',
        404,
        'ADOPTION_NOT_FOUND'
      );
    }

    res.status(200).json({
      data: adoptions[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/adoptions/:id/approve
 * Approve an adoption request
 * Requires: Pet owner or SHELTER_ADMIN role
 */
export async function approveAdoption(req, res, next) {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    // Get adoption request
    const adoptions = await select('adoptions', { id });
    if (!adoptions || adoptions.length === 0) {
      throw new ApiError(
        'Adoption request not found',
        404,
        'ADOPTION_NOT_FOUND'
      );
    }

    const adoption = adoptions[0];

    // Get pet to check authorization
    const pets = await select('pets', { id: adoption.pet_id });
    if (!pets || pets.length === 0) {
      throw new ApiError(
        'Pet not found',
        404,
        'PET_NOT_FOUND'
      );
    }

    const pet = pets[0];

    // Check authorization
    if (pet.owner_id !== req.user.userId) {
      throw new ApiError(
        'Not authorized to approve this adoption',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Update adoption status
    await update('adoptions', {
      adoption_status: 'APPROVED',
      updated_at: new Date().toISOString(),
    }, { id });

    // Update pet status to ADOPTED
    await update('pets', {
      pet_status: 'ADOPTED',
      updated_at: new Date().toISOString(),
    }, { id: adoption.pet_id });

    res.status(200).json({
      message: 'Adoption approved successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/adoptions/:id/reject
 * Reject an adoption request
 * Requires: Pet owner or SHELTER_ADMIN role
 */
export async function rejectAdoption(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    // Get adoption request
    const adoptions = await select('adoptions', { id });
    if (!adoptions || adoptions.length === 0) {
      throw new ApiError(
        'Adoption request not found',
        404,
        'ADOPTION_NOT_FOUND'
      );
    }

    const adoption = adoptions[0];

    // Get pet to check authorization
    const pets = await select('pets', { id: adoption.pet_id });
    if (!pets || pets.length === 0) {
      throw new ApiError(
        'Pet not found',
        404,
        'PET_NOT_FOUND'
      );
    }

    const pet = pets[0];

    // Check authorization
    if (pet.owner_id !== req.user.userId) {
      throw new ApiError(
        'Not authorized to reject this adoption',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Update adoption status
    await update('adoptions', {
      adoption_status: 'REJECTED',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    }, { id });

    res.status(200).json({
      message: 'Adoption rejected successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/adoptions/adopter/:adopterId
 * Get all adoptions for a specific adopter
 */
export async function getAdoptionsByAdopter(req, res, next) {
  try {
    const { adopterId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const adoptions = await select('adoptions', { adopter_id: adopterId });
    const totalCount = adoptions.length;

    const paginatedAdoptions = adoptions.slice(offset, offset + limit);

    res.status(200).json({
      data: paginatedAdoptions,
      pagination: {
        total: totalCount,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/adoptions/pet/:petId
 * Get all adoption requests for a specific pet
 */
export async function getAdoptionsByPet(req, res, next) {
  try {
    const { petId } = req.params;

    const adoptions = await select('adoptions', { pet_id: petId });

    res.status(200).json({
      data: adoptions,
    });
  } catch (error) {
    next(error);
  }
}
