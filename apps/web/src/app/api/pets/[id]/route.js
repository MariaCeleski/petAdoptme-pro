import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { petSchema, petStatusUpdateSchema } from '@/lib/validation/schemas';
import { isValidCUID } from '@/lib/auth-utils';

/**
 * GET /api/pets/[id] - Get specific pet by ID
 * Requirements: 5.1, 5.2, 5.3, 5.4
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Validate pet ID format
    if (!id || !isValidCUID(id)) {
      return NextResponse.json({
        error: 'Invalid pet ID format',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        path: `/api/pets/${id}`
      }, { status: 400 });
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
            type: true
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
            description: true
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
      return NextResponse.json({
        error: 'Pet not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: `/api/pets/${id}`
      }, { status: 404 });
    }

    // Transform pet data for response
    const transformedPet = {
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

    return NextResponse.json({
      pet: transformedPet
    });

  } catch (error) {
    console.error(`GET /api/pets/[id] error:`, error);
    
    return NextResponse.json({
      error: 'Failed to fetch pet details',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: `/api/pets/[id]`
    }, { status: 500 });
  }
}

/**
 * PATCH /api/pets/[id] - Update pet information
 * Requirements: 2.5, 2.6
 */
export async function PATCH(request, { params }) {
  let id;
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
        path: `/api/pets/[id]`
      }, { status: 401 });
    }

    const paramsData = await params;
    id = paramsData.id;

    // Validate pet ID format
    if (!id || !isValidCUID(id)) {
      return NextResponse.json({
        error: 'Invalid pet ID format',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        path: `/api/pets/${id}`
      }, { status: 400 });
    }

    // Check if pet exists and user owns it
    const existingPet = await prisma.pet.findUnique({
      where: { id },
      include: {
        owner: true
      }
    });

    if (!existingPet) {
      return NextResponse.json({
        error: 'Pet not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: `/api/pets/${id}`
      }, { status: 404 });
    }

    // Check authorization - only pet owner can update
    if (existingPet.ownerId !== session.user.id) {
      return NextResponse.json({
        error: 'You can only edit your own pets',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
        path: `/api/pets/${id}`
      }, { status: 403 });
    }

    const updateData = await request.json();

    // Check if this is a status-only update (Requirement 2.6)
    if (updateData.status && Object.keys(updateData).length === 1) {
      // Validate status update
      const statusValidation = petStatusUpdateSchema.safeParse({
        status: updateData.status,
        petId: id,
        ownerId: session.user.id
      });

      if (!statusValidation.success) {
        return NextResponse.json({
          error: 'Invalid status update',
          code: 'VALIDATION_ERROR',
          details: statusValidation.error.format(),
          timestamp: new Date().toISOString(),
          path: `/api/pets/${id}`
        }, { status: 400 });
      }

      // Update only status
      const updatedPet = await prisma.pet.update({
        where: { id },
        data: { 
          status: updateData.status,
          updatedAt: new Date()
        },
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
        }
      });

      const transformedPet = {
        id: updatedPet.id,
        name: updatedPet.name,
        species: updatedPet.species,
        breed: updatedPet.breed,
        age: updatedPet.age,
        size: updatedPet.size,
        gender: updatedPet.gender,
        color: updatedPet.color,
        description: updatedPet.description,
        isNeutered: updatedPet.isNeutered,
        isVaccinated: updatedPet.isVaccinated,
        healthStatus: updatedPet.healthStatus,
        personality: JSON.parse(updatedPet.personality),
        images: JSON.parse(updatedPet.images),
        status: updatedPet.status,
        location: updatedPet.location,
        createdAt: updatedPet.createdAt,
        updatedAt: updatedPet.updatedAt,
        owner: updatedPet.owner,
        shelter: updatedPet.shelter
      };

      return NextResponse.json({
        message: 'Pet status updated successfully',
        pet: transformedPet
      });
    }

    // Full pet data update (Requirement 2.5)
    const validation = petSchema.safeParse(updateData);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Pet validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.format(),
        timestamp: new Date().toISOString(),
        path: `/api/pets/${id}`
      }, { status: 400 });
    }

    const validatedData = validation.data;

    // Prepare update data - handle array fields for SQLite
    const dbUpdateData = {
      ...validatedData,
      personality: JSON.stringify(validatedData.personality || []),
      images: JSON.stringify(validatedData.images || []),
      updatedAt: new Date()
    };

    // Update pet in database
    const updatedPet = await prisma.pet.update({
      where: { id },
      data: dbUpdateData,
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
      }
    });

    // Transform response data
    const transformedPet = {
      id: updatedPet.id,
      name: updatedPet.name,
      species: updatedPet.species,
      breed: updatedPet.breed,
      age: updatedPet.age,
      size: updatedPet.size,
      gender: updatedPet.gender,
      color: updatedPet.color,
      description: updatedPet.description,
      isNeutered: updatedPet.isNeutered,
      isVaccinated: updatedPet.isVaccinated,
      healthStatus: updatedPet.healthStatus,
      personality: JSON.parse(updatedPet.personality),
      images: JSON.parse(updatedPet.images),
      status: updatedPet.status,
      location: updatedPet.location,
      createdAt: updatedPet.createdAt,
      updatedAt: updatedPet.updatedAt,
      owner: updatedPet.owner,
      shelter: updatedPet.shelter
    };

    return NextResponse.json({
      message: 'Pet updated successfully',
      pet: transformedPet
    });

  } catch (error) {
    console.error(`PATCH /api/pets/${id || '[id]'} error:`, error);
    
    return NextResponse.json({
      error: 'Failed to update pet',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: `/api/pets/${id || '[id]'}`
    }, { status: 500 });
  }
}

/**
 * DELETE /api/pets/[id] - Archive pet (soft delete)
 * Requirements: 2.7
 */
export async function DELETE(request, { params }) {
  let id;
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
        path: `/api/pets/[id]`
      }, { status: 401 });
    }

    const paramsData = await params;
    id = paramsData.id;

    // Validate pet ID format
    if (!id || !isValidCUID(id)) {
      return NextResponse.json({
        error: 'Invalid pet ID format',
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        path: `/api/pets/${id}`
      }, { status: 400 });
    }

    // Check if pet exists and user owns it
    const existingPet = await prisma.pet.findUnique({
      where: { id },
      include: {
        adoptions: {
          select: { id: true, status: true }
        }
      }
    });

    if (!existingPet) {
      return NextResponse.json({
        error: 'Pet not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: `/api/pets/${id}`
      }, { status: 404 });
    }

    // Check authorization - only pet owner can delete
    if (existingPet.ownerId !== session.user.id) {
      return NextResponse.json({
        error: 'You can only delete your own pets',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
        path: `/api/pets/${id}`
      }, { status: 403 });
    }

    // Check if pet has pending adoptions - prevent deletion
    const hasPendingAdoptions = existingPet.adoptions.some(
      adoption => ['PENDING', 'APPROVED'].includes(adoption.status)
    );

    if (hasPendingAdoptions) {
      return NextResponse.json({
        error: 'Cannot delete pet with pending or approved adoptions',
        code: 'CONFLICT',
        timestamp: new Date().toISOString(),
        path: `/api/pets/${id}`
      }, { status: 409 });
    }

    // Soft delete - archive the pet by changing status to UNAVAILABLE (Requirement 2.7)
    // This preserves the record and adoption history
    const archivedPet = await prisma.pet.update({
      where: { id },
      data: { 
        status: 'UNAVAILABLE',
        updatedAt: new Date()
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      }
    });

    return NextResponse.json({
      message: 'Pet archived successfully',
      pet: {
        id: archivedPet.id,
        name: archivedPet.name,
        status: archivedPet.status,
        updatedAt: archivedPet.updatedAt
      }
    });

  } catch (error) {
    console.error(`DELETE /api/pets/${id || '[id]'} error:`, error);
    
    return NextResponse.json({
      error: 'Failed to archive pet',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: `/api/pets/${id || '[id]'}`
    }, { status: 500 });
  }
}