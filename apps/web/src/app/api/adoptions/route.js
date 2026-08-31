import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { adoptionSchema } from '@/lib/validation/schemas';
import { sendAdoptionRequestEmail } from '@/lib/email';

/**
 * GET /api/adoptions
 * List adoption requests filtered by user role and ID
 * - Adopters see their own adoption requests
 * - Pet owners see adoption requests for their pets
 * Requirements: 6.8 (adoption request history and status tracking)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
        path: '/api/adoptions'
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    const petId = searchParams.get('petId');

    let whereClause = {};

    // Filter by user role
    if (session.user.type === 'ADOPTER') {
      // Adopters see their own adoption requests
      whereClause.adopterId = session.user.id;
    } else if (['SHELTER_ADMIN', 'INDIVIDUAL_OWNER'].includes(session.user.type)) {
      // Pet owners see adoption requests for their pets
      whereClause.pet = {
        ownerId: session.user.id
      };
    } else {
      return NextResponse.json({
        error: 'Invalid user type',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
        path: '/api/adoptions'
      }, { status: 403 });
    }

    // Optionally filter by specific pet (Requirement 2.3 - show adoption requests for specific pet)
    if (petId) {
      whereClause.petId = petId;
    }

    // Get total count for pagination
    const total = await prisma.adoption.count({ where: whereClause });

    // Get adoptions with related data
    const adoptions = await prisma.adoption.findMany({
      where: whereClause,
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            images: true,
            status: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        adopter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip
    });

    // Parse JSON strings for response
    const formattedAdoptions = adoptions.map(adoption => ({
      ...adoption,
      adopterInfo: adoption.adopterInfo ? JSON.parse(adoption.adopterInfo) : null,
      pet: {
        ...adoption.pet,
        images: adoption.pet.images ? JSON.parse(adoption.pet.images) : []
      }
    }));

    return NextResponse.json({
      adoptions: formattedAdoptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching adoptions:', error);
    return NextResponse.json({
      error: 'Failed to fetch adoptions',
      code: 'FETCH_ERROR',
      timestamp: new Date().toISOString(),
      path: '/api/adoptions'
    }, { status: 500 });
  }
}

/**
 * POST /api/adoptions
 * Create new adoption request
 * Requirements: 6.3 (adoption request creation), 6.4 (email notification to pet owner)
 */
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
        path: '/api/adoptions'
      }, { status: 401 });
    }

    // Only adopters can create adoption requests
    if (session.user.type !== 'ADOPTER') {
      return NextResponse.json({
        error: 'Only adopters can create adoption requests',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
        path: '/api/adoptions'
      }, { status: 403 });
    }

    const requestData = await request.json();

    // Validate adoption data (Requirements 6.2 validation)
    const validation = adoptionSchema.safeParse(requestData);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Adoption validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.format(),
        timestamp: new Date().toISOString(),
        path: '/api/adoptions'
      }, { status: 400 });
    }

    const validatedData = validation.data;

    // Check if pet exists and is available (Requirement 6.3)
    const pet = await prisma.pet.findUnique({
      where: { id: validatedData.petId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            type: true
          }
        }
      }
    });

    if (!pet) {
      return NextResponse.json({
        error: 'Pet not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: '/api/adoptions'
      }, { status: 404 });
    }

    if (pet.status !== 'APPROVED') {
      return NextResponse.json({
        error: 'Pet is not available for adoption',
        code: 'PET_UNAVAILABLE',
        details: { currentStatus: pet.status },
        timestamp: new Date().toISOString(),
        path: '/api/adoptions'
      }, { status: 400 });
    }

    // Check if adopter has already submitted a pending request for this pet
    const existingRequest = await prisma.adoption.findFirst({
      where: {
        petId: validatedData.petId,
        adopterId: session.user.id,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      return NextResponse.json({
        error: 'You already have a pending adoption request for this pet',
        code: 'DUPLICATE_REQUEST',
        timestamp: new Date().toISOString(),
        path: '/api/adoptions'
      }, { status: 409 });
    }

    // Create adoption request (Requirement 6.3)
    const adoption = await prisma.adoption.create({
      data: {
        petId: validatedData.petId,
        adopterId: session.user.id,
        status: 'PENDING',
        message: validatedData.message || null,
        adopterInfo: JSON.stringify(validatedData.adopterInfo)
      },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            images: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        adopter: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Update pet status to PENDING (Requirement 6.3 - pet cannot have multiple active requests)
    await prisma.pet.update({
      where: { id: validatedData.petId },
      data: { status: 'PENDING' }
    });

    // Send email notification to pet owner (Requirement 6.4)
    try {
      await sendAdoptionRequestEmail(pet.owner.email, {
        ownerName: pet.owner.name,
        petName: pet.name,
        adopterName: session.user.name,
        adoptionId: adoption.id
      });
    } catch (emailError) {
      console.error('Failed to send adoption request email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // Format response
    const responseData = {
      ...adoption,
      adopterInfo: JSON.parse(adoption.adopterInfo),
      pet: {
        ...adoption.pet,
        images: adoption.pet.images ? JSON.parse(adoption.pet.images) : []
      }
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Error creating adoption request:', error);
    return NextResponse.json({
      error: 'Failed to create adoption request',
      code: 'CREATE_ERROR',
      timestamp: new Date().toISOString(),
      path: '/api/adoptions'
    }, { status: 500 });
  }
}
