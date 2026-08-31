import { prisma } from '@/lib/prisma';
import { filterSchema } from '@/lib/validation/schemas';
import { isValidCUID } from '@/lib/auth-utils';

/**
 * Server-side pet fetching utilities
 * Requirements: 4.1-4.6 (Public catalog filters), 5.1-5.4 (Pet details)
 */

/**
 * Fetch pets with filters - Server Component compatible
 * @param {Object} filters - Filter parameters
 * @returns {Promise<{pets: Array, pagination: Object, filters: Object}>}
 */
export async function fetchPets(filters = {}) {
  try {
    // Validate and transform filters
    const validation = filterSchema.safeParse(filters);
    if (!validation.success) {
      console.error('Invalid filter parameters:', validation.error);
      return {
        pets: [],
        pagination: {
          page: 1,
          limit: 12,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        filters: filters,
        error: 'Invalid filter parameters'
      };
    }

    const { species, size, gender, location, search, page, limit } = validation.data;
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const whereClause = {
      // Only show approved pets in public listings (Requirement 4.1)
      status: 'APPROVED'
    };

    // Apply species filter (Requirement 4.2)
    if (species) {
      whereClause.species = species;
    }

    // Apply size filter (Requirement 4.3) 
    if (size) {
      whereClause.size = size;
    }

    // Apply gender filter (Requirement 4.5)
    if (gender) {
      whereClause.gender = gender;
    }

    // Apply location filter if provided
    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      };
    }

    // Apply text search (Requirement 4.6) - search in name and breed
    if (search) {
      whereClause.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          breed: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Execute query with pagination
    const [pets, totalCount] = await Promise.all([
      prisma.pet.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              type: true
            }
          },
          shelter: {
            select: {
              id: true,
              name: true,
              city: true,
              state: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.pet.count({
        where: whereClause
      })
    ]);

    // Transform pets data for response
    const transformedPets = pets.map(pet => ({
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      size: pet.size,
      gender: pet.gender,
      color: pet.color,
      description: pet.description,
      isNeutered: pet.isNeutered,
      isVaccinated: pet.isVaccinated,
      healthStatus: pet.healthStatus,
      personality: Array.isArray(pet.personality) 
        ? pet.personality 
        : (pet.personality ? JSON.parse(pet.personality) : []),
      images: Array.isArray(pet.images) 
        ? pet.images 
        : (pet.images ? JSON.parse(pet.images) : []),
      status: pet.status,
      location: pet.location,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
      owner: pet.owner,
      shelter: pet.shelter
    }));

    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      pets: transformedPets,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      },
      filters: {
        species,
        size,
        gender,
        location,
        search
      }
    };

  } catch (error) {
    console.error('Server-side pet fetch error:', error);
    
    return {
      pets: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
      },
      filters: filters,
      error: 'Failed to fetch pets'
    };
  }
}

/**
 * Fetch single pet by ID - Server Component compatible
 * Requirements: 5.1, 5.2, 5.3, 5.4
 * @param {string} id - Pet ID
 * @returns {Promise<Object|null>}
 */
export async function fetchPetById(id) {
  try {
    // Validate pet ID format
    if (!id || !isValidCUID(id)) {
      console.error('Invalid pet ID format:', id);
      return null;
    }

    // Fetch pet with owner and shelter information
    const pet = await prisma.pet.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true,
            createdAt: true
          }
        },
        shelter: {
          select: {
            id: true,
            name: true,
            address: true,
            city: true,
            state: true,
            phone: true,
            email: true,
            website: true,
            description: true,
            createdAt: true
          }
        },
        adoptions: {
          where: { status: 'COMPLETED' },
          select: {
            id: true,
            completedAt: true,
            adopter: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            completedAt: 'desc'
          },
          take: 5 // Limit to recent adoptions for success stories
        }
      }
    });

    if (!pet) {
      return null;
    }

    // Transform pet data for response
    return {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      size: pet.size,
      gender: pet.gender,
      color: pet.color,
      description: pet.description,
      isNeutered: pet.isNeutered,
      isVaccinated: pet.isVaccinated,
      healthStatus: pet.healthStatus,
      personality: Array.isArray(pet.personality) 
        ? pet.personality 
        : (pet.personality ? JSON.parse(pet.personality) : []),
      images: Array.isArray(pet.images) 
        ? pet.images 
        : (pet.images ? JSON.parse(pet.images) : []),
      status: pet.status,
      location: pet.location,
      createdAt: pet.createdAt,
      updatedAt: pet.updatedAt,
      owner: pet.owner,
      shelter: pet.shelter,
      successStories: pet.adoptions.map(adoption => ({
        id: adoption.id,
        completedAt: adoption.completedAt,
        adopterName: adoption.adopter.name
      }))
    };

  } catch (error) {
    console.error('Server-side pet fetch by ID error:', error);
    return null;
  }
}

/**
 * Get pet statistics for display
 * @returns {Promise<{totalAvailable: number, bySpecies: Object, bySize: Object}>}
 */
export async function getPetStats() {
  try {
    const [totalAvailable, speciesStats, sizeStats] = await Promise.all([
      prisma.pet.count({
        where: { status: 'APPROVED' }
      }),
      prisma.pet.groupBy({
        by: ['species'],
        where: { status: 'APPROVED' },
        _count: true
      }),
      prisma.pet.groupBy({
        by: ['size'],
        where: { status: 'APPROVED' },
        _count: true
      })
    ]);

    const bySpecies = speciesStats.reduce((acc, stat) => {
      acc[stat.species] = stat._count;
      return acc;
    }, {});

    const bySize = sizeStats.reduce((acc, stat) => {
      acc[stat.size] = stat._count;
      return acc;
    }, {});

    return {
      totalAvailable,
      bySpecies,
      bySize
    };
  } catch (error) {
    console.error('Error fetching pet stats:', error);
    return {
      totalAvailable: 0,
      bySpecies: {},
      bySize: {}
    };
  }
}