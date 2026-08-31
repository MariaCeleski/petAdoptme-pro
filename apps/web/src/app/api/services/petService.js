/**
 * Pet Service - Centralizes all pet business logic
 * Handles: CRUD operations, filtering, searching, validation
 */

import { prisma } from '@/lib/prisma';

export const petService = {
  /**
   * Get all pets with filtering and pagination
   */
  async listPets(filters) {
    const {
      species,
      size,
      gender,
      location,
      search,
      page = 1,
      limit = 12,
      status = 'APPROVED',
      shelterId,
      ownerId,
    } = filters;

    const skip = (page - 1) * limit;
    const whereClause = {};

    // Apply status filter
    if (status !== 'ALL') {
      whereClause.status = status;
    }

    // Apply filters
    if (species) whereClause.species = species;
    if (size) whereClause.size = size;
    if (gender) whereClause.gender = gender;
    if (location) whereClause.location = location;
    if (shelterId) whereClause.shelterId = shelterId;
    if (ownerId) whereClause.ownerId = ownerId;

    // Apply search (text search on name and breed)
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { breed: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [pets, total] = await Promise.all([
      prisma.pet.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { id: true, name: true, email: true } },
          shelter: { select: { id: true, name: true } },
        },
      }),
      prisma.pet.count({ where: whereClause }),
    ]);

    return {
      pets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Get a single pet by ID
   */
  async getPetById(id) {
    return prisma.pet.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true } },
        shelter: true,
        adoptions: { include: { adopter: true } },
      },
    });
  },

  /**
   * Create a new pet
   */
  async createPet(data, userId) {
    return prisma.pet.create({
      data: {
        ...data,
        ownerId: userId,
      },
      include: {
        owner: true,
        shelter: true,
      },
    });
  },

  /**
   * Update a pet
   */
  async updatePet(id, data, userId) {
    const pet = await prisma.pet.findUnique({ where: { id } });

    if (!pet) throw new Error('Pet not found');
    if (pet.ownerId !== userId) throw new Error('Unauthorized');

    return prisma.pet.update({
      where: { id },
      data,
      include: { owner: true, shelter: true },
    });
  },

  /**
   * Delete a pet
   */
  async deletePet(id, userId) {
    const pet = await prisma.pet.findUnique({ where: { id } });

    if (!pet) throw new Error('Pet not found');
    if (pet.ownerId !== userId) throw new Error('Unauthorized');

    return prisma.pet.delete({ where: { id } });
  },

  /**
   * Get pets by owner
   */
  async getPetsByOwner(ownerId) {
    return prisma.pet.findMany({
      where: { ownerId },
      include: { adoptions: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get pets by shelter
   */
  async getPetsByShel ter(shelterId) {
    return prisma.pet.findMany({
      where: { shelterId },
      include: { adoptions: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Search pets by text
   */
  async searchPets(query, limit = 20) {
    return prisma.pet.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { breed: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: limit,
      select: { id: true, name: true, species: true, breed: true },
    });
  },
};
