/**
 * Pet Controller
 * Handles CRUD operations for pets
 * Phase 2: Added photo upload support via Cloudinary
 */

import { ApiError } from '../middleware/errorHandler.js';
import { insert, select, update, remove, count } from '../services/supabaseClient.js';
import { createPetSchema, updatePetSchema } from '@petadopt/shared';
import cloudinaryService from '../services/cloudinary.service.js';
import emailService from '../services/email.service.js';

/**
 * POST /api/pets
 * Create a new pet with photo upload
 * Phase 2: Now accepts FormData with photos
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

    console.log('🐾 Creating pet...');
    console.log('   Files received:', req.files ? req.files.length : 0);
    console.log('   Body fields:', Object.keys(req.body));

    // Combine req.body (form fields) and req.files (photos)
    const petDataRaw = {
      name: req.body.name,
      species: req.body.species,
      breed: req.body.breed,
      age: req.body.age,
      gender: req.body.gender,
      size: req.body.size,
      color: req.body.color,
      description: req.body.description,
      isVaccinated: req.body.isVaccinated === 'true' || req.body.isVaccinated === true,
      isNeutered: req.body.isNeutered === 'true' || req.body.isNeutered === true,
      healthStatus: req.body.healthStatus || undefined,
      personality: req.body.personality ? JSON.parse(req.body.personality) : undefined,
    };

    // Validate data with Zod schema
    let petData;
    try {
      petData = await createPetSchema.parseAsync(petDataRaw);
      console.log('✅ Pet data validated');
    } catch (validationError) {
      console.error('❌ Validation error:', validationError.errors);
      const details = validationError.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
        code: e.code,
      }));
      throw new ApiError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        details
      );
    }

    // Phase 2: Handle photo uploads
    let photosData = [];
    if (req.files && req.files.length > 0) {
      try {
        console.log(`📸 Processing ${req.files.length} photo(s) from Cloudinary...`);
        const uploadResults = await cloudinaryService.uploadMultiplePhotos(req.files);
        photosData = cloudinaryService.formatPhotosForDB(uploadResults);
        console.log(`✅ Successfully uploaded ${uploadResults.length} photos`);
        console.log('   Photos data:', photosData);
      } catch (uploadError) {
        console.error('❌ Photo upload error:', uploadError.message);
        console.error('   Stack:', uploadError.stack);
        // Don't fail the pet creation if photos fail - continue anyway
      }
    } else {
      console.log('ℹ️ No photos submitted');
    }

    // Convert camelCase to snake_case for Supabase
    const dbPetData = {
      name: petData.name,
      species: petData.species,
      breed: petData.breed,
      age: petData.age,
      gender: petData.gender,
      size: petData.size,
      color: petData.color,
      description: petData.description,
      is_vaccinated: petData.isVaccinated,
      is_neutered: petData.isNeutered,
      health_status: petData.healthStatus || null,
      personality: petData.personality || [],
      owner_id: req.user.userId,
      status: 'AVAILABLE',
      
      // Phase 2: New columns
      photos: photosData,
      adoption_reason: req.body.adoption_reason || null,
      owner_name: req.body.owner_name || null,
      owner_phone: req.body.owner_phone || null,
      owner_email: req.body.owner_email || null,
      approval_status: 'PENDING', // Phase 2: Requires admin approval
      rejection_reason: null,
      
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('💾 Saving pet to database...');
    // Create pet
    const newPet = await insert('pets', dbPetData);

    if (!newPet || newPet.length === 0) {
      throw new ApiError(
        'Failed to create pet',
        500,
        'PET_CREATION_FAILED'
      );
    }

    const pet = newPet[0];
    console.log(`✅ Pet created: ${pet.id}`);
    console.log('   Photos saved:', pet.photos ? pet.photos.length : 0);

    // Phase 2: Send confirmation email to owner
    if (req.body.owner_email) {
      try {
        await emailService.sendPetRegistrationConfirmation(
          req.body.owner_email,
          req.body.owner_name || 'Pet Owner',
          petData.name
        );
        console.log(`✅ Confirmation email sent to ${req.body.owner_email}`);
      } catch (emailError) {
        console.error('⚠️ Email error:', emailError.message);
        // Don't fail if email fails
      }
    }

    res.status(201).json({
      message: 'Pet created successfully',
      data: pet,
    });
  } catch (error) {
    next(error);
  }
}

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
 * PATCH /api/pets/:id
 * Update pet information with optional photo management
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

    // Get current pet
    const pets = await select('pets', { id });
    if (!pets || pets.length === 0) {
      throw new ApiError(
        'Pet not found',
        404,
        'PET_NOT_FOUND'
      );
    }

    const currentPet = pets[0];

    // Check ownership
    if (currentPet.owner_id !== req.user.userId && req.user.role !== 'admin') {
      throw new ApiError(
        'Unauthorized',
        403,
        'NOT_OWNER'
      );
    }

    // Parse and validate update data
    const updateDataRaw = {
      name: req.body.name,
      species: req.body.species,
      breed: req.body.breed,
      age: req.body.age,
      gender: req.body.gender,
      size: req.body.size,
      color: req.body.color,
      description: req.body.description,
      isVaccinated: req.body.isVaccinated !== undefined ? (req.body.isVaccinated === 'true' || req.body.isVaccinated === true) : undefined,
      isNeutered: req.body.isNeutered !== undefined ? (req.body.isNeutered === 'true' || req.body.isNeutered === true) : undefined,
      healthStatus: req.body.healthStatus,
      personality: req.body.personality ? JSON.parse(req.body.personality) : undefined,
    };

    let updateData;
    try {
      updateData = await updatePetSchema.parseAsync(updateDataRaw);
    } catch (validationError) {
      const details = validationError.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      throw new ApiError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        details
      );
    }

    // Handle photo updates
    let photosData = currentPet.photos || [];
    
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await cloudinaryService.uploadMultiplePhotos(req.files);
        const newPhotos = cloudinaryService.formatPhotosForDB(uploadResults);
        photosData = [...photosData, ...newPhotos];
        console.log(`✅ Updated photos for pet ${id}`);
      } catch (uploadError) {
        console.error('⚠️ Photo upload error:', uploadError.message);
      }
    }

    // Handle photo deletions (if requested)
    if (req.body.deletePhotos) {
      const photosToDelete = Array.isArray(req.body.deletePhotos) 
        ? req.body.deletePhotos 
        : [req.body.deletePhotos];
      
      for (const photoUrl of photosToDelete) {
        try {
          await cloudinaryService.deletePhoto(photoUrl);
          photosData = photosData.filter(p => p.url !== photoUrl);
          console.log(`✅ Deleted photo from Cloudinary`);
        } catch (deleteError) {
          console.error('⚠️ Photo delete error:', deleteError.message);
        }
      }
    }

    // Build update object
    const dbUpdateData = {
      ...Object.fromEntries(
        Object.entries(updateData)
          .filter(([, v]) => v !== undefined)
          .map(([k, v]) => [
            k === 'isVaccinated' ? 'is_vaccinated' : 
            k === 'isNeutered' ? 'is_neutered' : 
            k === 'healthStatus' ? 'health_status' :
            k,
            v
          ])
      ),
      photos: photosData,
      updated_at: new Date().toISOString(),
    };

    // Update pet
    const updatedPets = await update('pets', { id }, dbUpdateData);

    if (!updatedPets || updatedPets.length === 0) {
      throw new ApiError(
        'Failed to update pet',
        500,
        'PET_UPDATE_FAILED'
      );
    }

    res.status(200).json({
      message: 'Pet updated successfully',
      data: updatedPets[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/pets/:id
 * Delete a pet and all associated data
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

    // Get pet
    const pets = await select('pets', { id });
    if (!pets || pets.length === 0) {
      throw new ApiError(
        'Pet not found',
        404,
        'PET_NOT_FOUND'
      );
    }

    const pet = pets[0];

    // Check ownership
    if (pet.owner_id !== req.user.userId && req.user.role !== 'admin') {
      throw new ApiError(
        'Unauthorized',
        403,
        'NOT_OWNER'
      );
    }

    // Delete photos from Cloudinary
    if (pet.photos && Array.isArray(pet.photos)) {
      for (const photo of pet.photos) {
        try {
          await cloudinaryService.deletePhoto(photo.url);
          console.log(`✅ Deleted photo from Cloudinary`);
        } catch (deleteError) {
          console.error('⚠️ Photo delete error:', deleteError.message);
        }
      }
    }

    // Delete from database (cascade will handle pet_compatibility)
    await remove('pets', { id });

    res.status(200).json({
      message: 'Pet deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/pets/:id/pet-compatibility
 * Save pet compatibility information
 */
export async function savePetCompatibility(req, res, next) {
  try {
    const { id } = req.params;
    const { good_with_dogs, good_with_cats, good_with_children } = req.body;

    const compatibilityData = {
      pet_id: id,
      good_with_dogs: good_with_dogs || false,
      good_with_cats: good_with_cats || false,
      good_with_children: good_with_children || false,
      created_at: new Date().toISOString(),
    };

    const result = await insert('pet_compatibility', compatibilityData);

    res.status(201).json({
      message: 'Pet compatibility saved successfully',
      data: result[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/pets/:id/pet-compatibility
 * Delete pet compatibility information
 */
export async function deletePetCompatibility(req, res, next) {
  try {
    const { id } = req.params;

    await remove('pet_compatibility', { pet_id: id });

    res.status(200).json({
      message: 'Pet compatibility deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}
