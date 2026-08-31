/**
 * Adoption Controller
 * Handles adoption request workflow
 * FASE 5.4: Integrated with Email Service for approval/rejection notifications
 */

import { ApiError } from '../middleware/errorHandler.js';
import { insert, select, update } from '../services/supabaseClient.js';
import { adoptionCreateSchema } from '@petadopt/shared';
import {
  sendAdoptionApprovedEmail,
  sendAdoptionRejectedEmail,
  sendAdoptionStatusUpdateEmail,
} from '../services/emailService.js';

export async function createAdoptionRequest(req, res, next) {
  try {
    if (!req.user) {
      throw new ApiError('Autenticação obrigatória', 401, 'NOT_AUTHENTICATED');
    }

    const adoptionData = await adoptionCreateSchema.parseAsync(req.body);

    const pets = await select('pets', { id: adoptionData.petId });
    if (!pets || pets.length === 0) {
      throw new ApiError('Pet não encontrado', 404, 'PET_NOT_FOUND');
    }

    const pet = pets[0];

    if (pet.pet_status !== 'AVAILABLE') {
      throw new ApiError(
        `Pet não está disponível para adoção (status: ${pet.pet_status})`,
        400,
        'PET_NOT_AVAILABLE'
      );
    }

    const newAdoption = await insert('adoptions', {
      ...adoptionData,
      pet_id: adoptionData.petId,
      adopter_id: req.user.userId,
      adoption_status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (!newAdoption || newAdoption.length === 0) {
      throw new ApiError('Falha ao criar solicitação de adoção', 500, 'ADOPTION_CREATION_FAILED');
    }

    try {
      const adopters = await select('users', { id: req.user.userId });
      if (adopters && adopters.length > 0) {
        await sendAdoptionStatusUpdateEmail(
          adopters[0].email,
          pet.name,
          'pending'
        );
      }
    } catch (emailError) {
      console.warn('⚠️ Aviso ao enviar email de status:', emailError);
    }

    res.status(201).json({
      message: 'Solicitação de adoção criada com sucesso',
      data: newAdoption[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function listAdoptions(req, res, next) {
  try {
    const { status, petId, adopterId, page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    const filter = {};
    if (status) filter.adoption_status = status;
    if (petId) filter.pet_id = petId;
    if (adopterId) filter.adopter_id = adopterId;

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

export async function getAdoptionById(req, res, next) {
  try {
    const { id } = req.params;

    const adoptions = await select('adoptions', { id });
    if (!adoptions || adoptions.length === 0) {
      throw new ApiError('Solicitação de adoção não encontrada', 404, 'ADOPTION_NOT_FOUND');
    }

    res.status(200).json({
      data: adoptions[0],
    });
  } catch (error) {
    next(error);
  }
}

export async function approveAdoption(req, res, next) {
  try {
    const { id } = req.params;

    if (!req.user) {
      throw new ApiError('Autenticação obrigatória', 401, 'NOT_AUTHENTICATED');
    }

    const adoptions = await select('adoptions', { id });
    if (!adoptions || adoptions.length === 0) {
      throw new ApiError('Solicitação de adoção não encontrada', 404, 'ADOPTION_NOT_FOUND');
    }

    const adoption = adoptions[0];

    const pets = await select('pets', { id: adoption.pet_id });
    if (!pets || pets.length === 0) {
      throw new ApiError('Pet não encontrado', 404, 'PET_NOT_FOUND');
    }

    const pet = pets[0];

    if (pet.owner_id !== req.user.userId) {
      throw new ApiError('Não autorizado a aprovar esta adoção', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    await update('adoptions', {
      adoption_status: 'APPROVED',
      updated_at: new Date().toISOString(),
    }, { id });

    await update('pets', {
      pet_status: 'ADOPTED',
      updated_at: new Date().toISOString(),
    }, { id: adoption.pet_id });

    try {
      const adopters = await select('users', { id: adoption.adopter_id });
      if (adopters && adopters.length > 0) {
        await sendAdoptionApprovedEmail(
          adopters[0].email,
          adopters[0].name,
          pet.name,
          id
        );
      }
    } catch (emailError) {
      console.warn('⚠️ Aviso ao enviar email de aprovação:', emailError);
    }

    res.status(200).json({
      message: 'Adoção aprovada com sucesso',
    });
  } catch (error) {
    next(error);
  }
}

export async function rejectAdoption(req, res, next) {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!req.user) {
      throw new ApiError('Autenticação obrigatória', 401, 'NOT_AUTHENTICATED');
    }

    const adoptions = await select('adoptions', { id });
    if (!adoptions || adoptions.length === 0) {
      throw new ApiError('Solicitação de adoção não encontrada', 404, 'ADOPTION_NOT_FOUND');
    }

    const adoption = adoptions[0];

    const pets = await select('pets', { id: adoption.pet_id });
    if (!pets || pets.length === 0) {
      throw new ApiError('Pet não encontrado', 404, 'PET_NOT_FOUND');
    }

    const pet = pets[0];

    if (pet.owner_id !== req.user.userId) {
      throw new ApiError('Não autorizado a rejeitar esta adoção', 403, 'INSUFFICIENT_PERMISSIONS');
    }

    await update('adoptions', {
      adoption_status: 'REJECTED',
      rejection_reason: reason,
      updated_at: new Date().toISOString(),
    }, { id });

    try {
      const adopters = await select('users', { id: adoption.adopter_id });
      if (adopters && adopters.length > 0) {
        await sendAdoptionRejectedEmail(
          adopters[0].email,
          adopters[0].name,
          pet.name,
          reason || 'Motivo não informado'
        );
      }
    } catch (emailError) {
      console.warn('⚠️ Aviso ao enviar email de rejeição:', emailError);
    }

    res.status(200).json({
      message: 'Adoção rejeitada com sucesso',
    });
  } catch (error) {
    next(error);
  }
}

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

export default {
  createAdoptionRequest,
  listAdoptions,
  getAdoptionById,
  approveAdoption,
  rejectAdoption,
  getAdoptionsByAdopter,
  getAdoptionsByPet,
};
