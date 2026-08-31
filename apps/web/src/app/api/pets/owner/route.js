import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

/**
 * GET /api/pets/owner
 * List pets owned by the authenticated user (pet owner dashboard)
 * Requirements: 7.2 (display registered pets with status)
 */
export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
        path: '/api/pets/owner'
      }, { status: 401 });
    }

    // Verify user is a pet owner
    if (!['SHELTER_ADMIN', 'INDIVIDUAL_OWNER'].includes(session.user.type)) {
      return NextResponse.json({
        error: 'Only pet owners can access this endpoint',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
        path: '/api/pets/owner'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Get total count of user's pets
    const totalCount = await prisma.pet.count({
      where: { ownerId: session.user.id }
    });

    // Get user's pets with pagination
    const pets = await prisma.pet.findMany({
      where: { ownerId: session.user.id },
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

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

    return NextResponse.json({
      pets: transformedPets,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('GET /api/pets/owner error:', error);
    
    return NextResponse.json({
      error: 'Failed to fetch owner pets',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: '/api/pets/owner'
    }, { status: 500 });
  }
}
