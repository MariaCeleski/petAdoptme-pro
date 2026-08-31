import { prisma } from './prisma';

/**
 * Fetch shelter data by ID with related information
 * Requirement 11.5
 */
export async function getShelterById(shelterId) {
  try {
    const shelter = await prisma.shelter.findUnique({
      where: { id: shelterId },
      include: {
        admin: {
          select: { id: true, name: true, email: true }
        },
        pets: {
          select: { id: true, status: true }
        }
      }
    });

    if (!shelter) {
      return null;
    }

    return {
      ...shelter,
      images: shelter.images ? JSON.parse(shelter.images) : []
    };
  } catch (error) {
    console.error('Error fetching shelter:', error);
    throw error;
  }
}

/**
 * Fetch shelter with full adoption statistics
 * Requirement 11.6
 */
export async function getShelterWithStats(shelterId) {
  try {
    const shelter = await getShelterById(shelterId);
    if (!shelter) return null;

    // Get adoption statistics
    const adoptions = await prisma.adoption.findMany({
      where: {
        pet: { shelterId }
      },
      select: {
        status: true,
        createdAt: true,
        approvedAt: true,
        completedAt: true
      }
    });

    const totalPets = await prisma.pet.count({
      where: { shelterId }
    });

    const availablePets = await prisma.pet.count({
      where: { shelterId, status: 'APPROVED' }
    });

    const pendingPets = await prisma.pet.count({
      where: { shelterId, status: 'PENDING' }
    });

    const adoptedPets = await prisma.pet.count({
      where: { shelterId, status: 'ADOPTED' }
    });

    // Calculate statistics
    const completedAdoptions = adoptions.filter(a => a.status === 'COMPLETED').length;
    const pendingAdoptions = adoptions.filter(a => a.status === 'PENDING').length;
    const approvedAdoptions = adoptions.filter(a => a.status === 'APPROVED').length;
    const rejectedAdoptions = adoptions.filter(a => a.status === 'REJECTED').length;

    let averageAdoptionDays = 0;
    const completedAdoptionTimes = adoptions
      .filter(a => a.status === 'COMPLETED' && a.createdAt && a.completedAt)
      .map(a => (new Date(a.completedAt) - new Date(a.createdAt)) / (1000 * 60 * 60 * 24));

    if (completedAdoptionTimes.length > 0) {
      averageAdoptionDays = Math.round(
        completedAdoptionTimes.reduce((a, b) => a + b, 0) / completedAdoptionTimes.length
      );
    }

    const adoptionRate = totalPets > 0 ? Math.round((adoptedPets / totalPets) * 100) : 0;
    const totalAdoptionRequests = adoptions.length;
    const successfulAdoptions = completedAdoptions + approvedAdoptions;
    const successRate = totalAdoptionRequests > 0
      ? Math.round((successfulAdoptions / totalAdoptionRequests) * 100)
      : 0;

    return {
      ...shelter,
      adoptionStats: {
        totalPets,
        availablePets,
        pendingPets,
        adoptedPets,
        adoptionRate,
        totalRequests: totalAdoptionRequests,
        pending: pendingAdoptions,
        approved: approvedAdoptions,
        completed: completedAdoptions,
        rejected: rejectedAdoptions,
        successRate,
        averageAdoptionDays
      }
    };
  } catch (error) {
    console.error('Error fetching shelter with stats:', error);
    throw error;
  }
}

/**
 * Get all shelters for a user (typically just one, but support multiple for future multi-shelter admins)
 * Requirement 11.7
 */
export async function getSheltersForAdmin(adminUserId) {
  try {
    const shelters = await prisma.shelter.findMany({
      where: {
        adminId: adminUserId
      },
      include: {
        pets: {
          select: { id: true, status: true }
        }
      }
    });

    return shelters.map(shelter => ({
      ...shelter,
      images: shelter.images ? JSON.parse(shelter.images) : []
    }));
  } catch (error) {
    console.error('Error fetching shelters for admin:', error);
    throw error;
  }
}

/**
 * Create a new shelter
 * Requirement 11.1, 11.2, 11.4
 */
export async function createShelter(adminUserId, shelterData) {
  try {
    const shelter = await prisma.shelter.create({
      data: {
        name: shelterData.name,
        address: shelterData.address,
        city: shelterData.city,
        state: shelterData.state,
        zipCode: shelterData.zipCode,
        phone: shelterData.phone,
        email: shelterData.email,
        website: shelterData.website || null,
        description: shelterData.description || null,
        logo: shelterData.logo || null,
        images: JSON.stringify(shelterData.images || []),
        isVerified: false,
        adminId: adminUserId
      },
      include: {
        admin: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return {
      ...shelter,
      images: JSON.parse(shelter.images)
    };
  } catch (error) {
    console.error('Error creating shelter:', error);
    throw error;
  }
}

/**
 * Update existing shelter
 * Requirement 11.1, 11.2, 11.4
 */
export async function updateShelter(shelterId, shelterData) {
  try {
    const shelter = await prisma.shelter.update({
      where: { id: shelterId },
      data: {
        ...(shelterData.name !== undefined && { name: shelterData.name }),
        ...(shelterData.address !== undefined && { address: shelterData.address }),
        ...(shelterData.city !== undefined && { city: shelterData.city }),
        ...(shelterData.state !== undefined && { state: shelterData.state }),
        ...(shelterData.zipCode !== undefined && { zipCode: shelterData.zipCode }),
        ...(shelterData.phone !== undefined && { phone: shelterData.phone }),
        ...(shelterData.email !== undefined && { email: shelterData.email }),
        ...(shelterData.website !== undefined && { website: shelterData.website || null }),
        ...(shelterData.description !== undefined && { description: shelterData.description || null }),
        ...(shelterData.logo !== undefined && { logo: shelterData.logo || null }),
        ...(shelterData.images !== undefined && { images: JSON.stringify(shelterData.images || []) })
      },
      include: {
        admin: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return {
      ...shelter,
      images: JSON.parse(shelter.images)
    };
  } catch (error) {
    console.error('Error updating shelter:', error);
    throw error;
  }
}

/**
 * Get pets for a shelter
 * Requirement 11.5
 */
export async function getShelterPets(shelterId, filters = {}) {
  try {
    const whereClause = {
      shelterId
    };

    if (filters.status) {
      whereClause.status = filters.status;
    }

    const pets = await prisma.pet.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        species: true,
        breed: true,
        age: true,
        size: true,
        gender: true,
        status: true,
        images: true,
        personality: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: filters.limit || 20,
      skip: filters.skip || 0
    });

    return pets.map(pet => ({
      ...pet,
      images: pet.images ? JSON.parse(pet.images) : [],
      personality: pet.personality ? JSON.parse(pet.personality) : []
    }));
  } catch (error) {
    console.error('Error fetching shelter pets:', error);
    throw error;
  }
}
