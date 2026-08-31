/**
 * Adoption Service - Centralizes all adoption business logic
 * Handles: Adoption requests, approvals, rejections, status updates
 */

import { prisma } from '@/lib/prisma';

export const adoptionService = {
  /**
   * Create adoption request
   */
  async createAdoptionRequest(data) {
    return prisma.adoption.create({
      data,
      include: {
        pet: true,
        adopter: { select: { id: true, name: true, email: true } },
      },
    });
  },

  /**
   * Get adoption by ID
   */
  async getAdoptionById(id) {
    return prisma.adoption.findUnique({
      where: { id },
      include: {
        pet: { include: { owner: true, shelter: true } },
        adopter: true,
      },
    });
  },

  /**
   * List adoptions with filters
   */
  async listAdoptions(filters) {
    const {
      status,
      adopterId,
      petId,
      page = 1,
      limit = 20,
    } = filters;

    const skip = (page - 1) * limit;
    const whereClause = {};

    if (status) whereClause.status = status;
    if (adopterId) whereClause.adopterId = adopterId;
    if (petId) whereClause.petId = petId;

    const [adoptions, total] = await Promise.all([
      prisma.adoption.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          pet: true,
          adopter: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.adoption.count({ where: whereClause }),
    ]);

    return {
      adoptions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  /**
   * Approve adoption request
   */
  async approveAdoption(id, userId) {
    const adoption = await prisma.adoption.findUnique({
      where: { id },
      include: { pet: true },
    });

    if (!adoption) throw new Error('Adoption not found');
    if (adoption.pet.ownerId !== userId && adoption.pet.shelterId !== userId) {
      throw new Error('Unauthorized');
    }

    return prisma.adoption.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        pet: { update: { status: 'ADOPTED' } },
      },
      include: { pet: true, adopter: true },
    });
  },

  /**
   * Reject adoption request
   */
  async rejectAdoption(id, userId, reason) {
    const adoption = await prisma.adoption.findUnique({
      where: { id },
      include: { pet: true },
    });

    if (!adoption) throw new Error('Adoption not found');
    if (adoption.pet.ownerId !== userId && adoption.pet.shelterId !== userId) {
      throw new Error('Unauthorized');
    }

    return prisma.adoption.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: reason,
      },
      include: { pet: true, adopter: true },
    });
  },

  /**
   * Get adoptions for adopter
   */
  async getAdopterAdoptions(adopterId) {
    return prisma.adoption.findMany({
      where: { adopterId },
      include: { pet: { include: { owner: true, shelter: true } } },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get adoption requests for pet owner
   */
  async getOwnerAdoptionRequests(ownerId) {
    return prisma.adoption.findMany({
      where: {
        pet: { ownerId },
      },
      include: {
        pet: true,
        adopter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Count pending adoptions
   */
  async countPendingAdoptions(ownerId) {
    return prisma.adoption.count({
      where: {
        pet: { ownerId },
        status: 'PENDING',
      },
    });
  },
};
