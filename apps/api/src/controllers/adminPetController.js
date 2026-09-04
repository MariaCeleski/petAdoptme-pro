/**
 * Admin Pet Controller - Phase 2
 * Handles pet approval/rejection workflow
 */

import { ApiError } from '../middleware/errorHandler.js';
import { select, update, count } from '../services/supabaseClient.js';
import emailService from '../services/email.service.js';

/**
 * GET /api/admin/pets/pending
 * List all pets pending approval
 */
export async function listPendingPets(req, res, next) {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    // Get all pending pets
    const pets = await select('pets', { approval_status: 'PENDING' });
    const totalCount = await count('pets', { approval_status: 'PENDING' });

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
 * PATCH /api/admin/pets/:id/approve
 * Approve a pet for adoption
 */
export async function approvePet(req, res, next) {
  try {
    const { id } = req.params;

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

    // Update pet status
    const updatedPet = await update('pets', {
      approval_status: 'APPROVED',
      rejection_reason: null,
      updated_at: new Date().toISOString(),
    }, { id });

    // Send approval email to owner
    try {
      if (pet.owner_email) {
        await emailService.sendApprovalEmail(pet);
        console.log(`✅ Approval email sent to ${pet.owner_email}`);
      }
    } catch (emailError) {
      console.error('⚠️ Email sending error:', emailError.message);
      // Don't fail approval if email fails
    }

    res.status(200).json({
      message: 'Pet approved successfully',
      data: updatedPet[0],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/pets/:id/reject
 * Reject a pet with reason
 */
export async function rejectPet(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) {
      throw new ApiError(
        'Rejection reason is required',
        400,
        'MISSING_REASON'
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

    // Update pet status
    const updatedPet = await update('pets', {
      approval_status: 'REJECTED',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    }, { id });

    // Send rejection email to owner
    try {
      if (pet.owner_email) {
        await emailService.sendRejectionEmail(pet, reason);
        console.log(`✅ Rejection email sent to ${pet.owner_email}`);
      }
    } catch (emailError) {
      console.error('⚠️ Email sending error:', emailError.message);
      // Don't fail rejection if email fails
    }

    res.status(200).json({
      message: 'Pet rejected successfully',
      data: updatedPet[0],
    });
  } catch (error) {
    next(error);
  }
}
