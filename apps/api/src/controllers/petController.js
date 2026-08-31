/**
 * Pet Controller
 * Handles CRUD operations for pets
 */

import { ApiError } from '../middleware/errorHandler.js';
import { insert, select, update, remove, count } from '../services/supabaseClient.js';
import { petCreateSchema, petUpdateSchema } from '@petadopt/shared';

/**
 * GET /api/pets
 * Get all available pets with filters and pagination
 */
export async function listPets(req, res, next) {
  try {
    const { page = 1, limit = 10, species, size, gender, status = 'AVAILABLE' } = req.query;

    const offset = (page - 1) * limit;

    // Build filter
    const filter = { status: status };
    if (species) filter.species = species;
    if (size) filter.size = size;
    if (gender) filter.gender = gender;

    // Get pets
    const pets = await select('pets', filter);
    const totalCount = await count('pets', filter);

    const paginatedPets = pets.slice(offset, offset + limit);

    res.status(200).json({
      data: paginatedPets,
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
 * GET /api/pets/:id
 * Get a single pet by ID
 */
export async function getPetById(req, res, next) {
  try {
    const { id } = req.params;

    const pets = await select('pets', { id });
    if (!pets || pets.length === 0) {
      throw new ApiError(
        'Pet not found',
        404,
        'PET_NOT_FOUND'
      );
    }

    const pet = pets[0];

    res.status(200).json({
      data: pet,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/pets
 * Create a new pet
 * Requires: INDIVIDUAL_OWNER or SHELTER_ADMIN role
 */
export async function createPet(req, res, next) {
  try {
    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    const petData = await petCreateSchema.parseAsync(req.body);

    // Create pet
    const newPet = await insert('pets', {
      ...petData,
      owner_id: req.user.userId,
      status: 'AVAILABLE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (!newPet || newPet.length === 0) {
      throw new ApiError(
        'Failed to create pet',
        500,
        'PET_CREATION_FAILED'
      );
    }

    res.status(201).json({
      message: 'Pet created successfully',
      data: newPet[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/pets/:id
 * Update a pet
 * Requires: Owner or SHELTER_ADMIN role
 */
export async function updatePet(req, res, next) {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    // Check if pet exists
    const pets = await select('pets', { id });
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
        'Not authorized to update this pet',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Validate update data
    const updateData = await petUpdateSchema.parseAsync(req.body);

    // Update pet
    const updatedPet = await update('pets', {
      ...updateData,
      updated_at: new Date().toISOString(),
    }, { id });

    res.status(200).json({
      message: 'Pet updated successfully',
      data: updatedPet[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/pets/:id
 * Archive a pet (soft delete)
 * Requires: Owner or SHELTER_ADMIN role
 */
export async function deletePet(req, res, next) {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    // Check if pet exists
    const pets = await select('pets', { id });
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
        'Not authorized to delete this pet',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Archive pet (soft delete)
    await update('pets', {
      status: 'ARCHIVED',
      updated_at: new Date().toISOString(),
    }, { id });

    res.status(200).json({
      message: 'Pet deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/pets/:id/status
 * Update pet status
 * Requires: Owner or SHELTER_ADMIN role
 */
export async function updatePetStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!req.user) {
      throw new ApiError(
        'Authentication required',
        401,
        'NOT_AUTHENTICATED'
      );
    }

    // Validate status
    const validStatuses = ['AVAILABLE', 'ADOPTED', 'ARCHIVED', 'UNAVAILABLE'];
    if (!validStatuses.includes(status)) {
      throw new ApiError(
        `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
        400,
        'INVALID_STATUS'
      );
    }

    // Check if pet exists
    const pets = await select('pets', { id });
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
        'Not authorized to update this pet',
        403,
        'INSUFFICIENT_PERMISSIONS'
      );
    }

    // Update status
    await update('pets', {
      status: status,
      updated_at: new Date().toISOString(),
    }, { id });

    res.status(200).json({
      message: `Pet status updated to ${status}`,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/pets/owner/:ownerId
 * Get all pets owned by a user
 */
export async function getPetsByOwner(req, res, next) {
  try {
    const { ownerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const pets = await select('pets', { owner_id: ownerId });
    const totalCount = await count('pets', { owner_id: ownerId });

    const paginatedPets = pets.slice(offset, offset + limit);

    res.status(200).json({
      data: paginatedPets,
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
