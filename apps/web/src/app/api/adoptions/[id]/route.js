import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { adoptionStatusUpdateSchema } from '@/lib/validation/schemas';

/**
 * GET /api/adoptions/[id]
 * Get a single adoption request by ID
 * Only the adopter or pet owner can view an adoption request
 */
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${params.id}`
      }, { status: 401 });
    }

    const adoption = await prisma.adoption.findUnique({
      where: { id: params.id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
            age: true,
            size: true,
            gender: true,
            description: true,
            images: true,
            status: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                type: true
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

    if (!adoption) {
      return NextResponse.json({
        error: 'Adoption not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${params.id}`
      }, { status: 404 });
    }

    // Authorization check - only adopter or pet owner can view
    if (adoption.adopterId !== session.user.id && adoption.pet.owner.id !== session.user.id) {
      return NextResponse.json({
        error: 'Forbidden',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${params.id}`
      }, { status: 403 });
    }

    // Format response
    const responseData = {
      ...adoption,
      adopterInfo: adoption.adopterInfo ? JSON.parse(adoption.adopterInfo) : null,
      pet: {
        ...adoption.pet,
        images: adoption.pet.images ? JSON.parse(adoption.pet.images) : []
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching adoption:', error);
    return NextResponse.json({
      error: 'Failed to fetch adoption',
      code: 'FETCH_ERROR',
      timestamp: new Date().toISOString(),
      path: `/api/adoptions/${params.id}`
    }, { status: 500 });
  }
}

/**
 * PATCH /api/adoptions/[id]
 * Update adoption request status
 * Requirements: 6.5 (allow approval/rejection), 6.6 (notify adopter), 6.7 (update pet status)
 *
 * Status transitions:
 * - PENDING -> APPROVED: Only pet owner can approve. Pet status becomes PENDING
 * - PENDING -> REJECTED: Only pet owner can reject. Pet status becomes AVAILABLE
 * - APPROVED -> COMPLETED: Pet owner or handler can complete. Pet status becomes ADOPTED
 * - PENDING/APPROVED -> CANCELLED: Only adopter can cancel
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${params.id}`
      }, { status: 401 });
    }

    const requestData = await request.json();

    // Validate status update data
    const validation = adoptionStatusUpdateSchema.safeParse({
      ...requestData,
      adoptionId: params.id
    });

    if (!validation.success) {
      return NextResponse.json({
        error: 'Status validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.format(),
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${params.id}`
      }, { status: 400 });
    }

    const { status, rejectionReason } = validation.data;

    // Get current adoption with pet and adopter info
    const adoption = await prisma.adoption.findUnique({
      where: { id: params.id },
      include: {
        pet: {
          select: {
            id: true,
            name: true,
            age: true,
            breed: true,
            status: true,
            ownerId: true,
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                type: true
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

    if (!adoption) {
      return NextResponse.json({
        error: 'Adoption not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${params.id}`
      }, { status: 404 });
    }

    // Authorization checks (Requirement 6.5)
    if (status === 'APPROVED' || status === 'REJECTED') {
      // Only pet owner can approve or reject
      if (adoption.pet.ownerId !== session.user.id) {
        return NextResponse.json({
          error: 'Only pet owner can approve or reject adoption requests',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
          path: `/api/adoptions/${params.id}`
        }, { status: 403 });
      }
    } else if (status === 'COMPLETED') {
      // Only pet owner or adoption handler can mark as completed
      if (adoption.pet.ownerId !== session.user.id) {
        return NextResponse.json({
          error: 'Only pet owner can complete adoption',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
          path: `/api/adoptions/${params.id}`
        }, { status: 403 });
      }
    } else if (status === 'CANCELLED') {
      // Only adopter can cancel
      if (adoption.adopterId !== session.user.id) {
        return NextResponse.json({
          error: 'Only adopter can cancel adoption request',
          code: 'FORBIDDEN',
          timestamp: new Date().toISOString(),
          path: `/api/adoptions/${params.id}`
        }, { status: 403 });
      }
    }

    // Validate status transitions
    const validTransitions = {
      'PENDING': ['APPROVED', 'REJECTED', 'CANCELLED'],
      'APPROVED': ['COMPLETED', 'CANCELLED'],
      'REJECTED': [],
      'COMPLETED': [],
      'CANCELLED': []
    };

    if (!validTransitions[adoption.status]?.includes(status)) {
      return NextResponse.json({
        error: `Invalid status transition from ${adoption.status} to ${status}`,
        code: 'INVALID_TRANSITION',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${params.id}`
      }, { status: 400 });
    }

    // Determine new pet status based on adoption status (Requirement 6.7)
    const petStatusMap = {
      'APPROVED': 'PENDING',      // Pet is pending the adoption completion
      'REJECTED': 'APPROVED',    // Pet becomes available again
      'COMPLETED': 'ADOPTED',     // Pet is adopted
      'CANCELLED': 'APPROVED'    // Pet becomes available again
    };

    const newPetStatus = petStatusMap[status];

    // Start transaction to update adoption and pet status
    const updatedAdoption = await prisma.adoption.update({
      where: { id: params.id },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        approvedAt: status === 'APPROVED' ? new Date() : null,
        completedAt: status === 'COMPLETED' ? new Date() : null
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

    // Update pet status (Requirement 6.7)
    if (newPetStatus) {
      await prisma.pet.update({
        where: { id: adoption.petId },
        data: { status: newPetStatus }
      });
    }

    // Send email notification to adopter (Requirement 6.6)
    try {
      if (status === 'APPROVED') {
        const { sendAdoptionApprovedEmail } = await import('@/lib/email.js');
        await sendAdoptionApprovedEmail(adoption.adopter.email, {
          adopterName: adoption.adopter.name,
          petName: adoption.pet.name,
          petAge: adoption.pet.age || 'Não informada',
          petBreed: adoption.pet.breed || 'Não informada',
          ownerName: adoption.pet.owner.name,
          ownerPhone: 'Contactar via dashboard' // Phone is not stored in our schema
        });
      } else if (status === 'REJECTED') {
        const { sendAdoptionRejectedEmail } = await import('@/lib/email.js');
        await sendAdoptionRejectedEmail(adoption.adopter.email, {
          adopterName: adoption.adopter.name,
          petName: adoption.pet.name,
          rejectionReason
        });
      }
    } catch (emailError) {
      console.error('Failed to send adoption status email:', emailError);
      // Don't fail the request if email fails, but log it
    }

    // Format response
    const responseData = {
      ...updatedAdoption,
      adopterInfo: updatedAdoption.adopterInfo ? JSON.parse(updatedAdoption.adopterInfo) : null,
      pet: {
        ...updatedAdoption.pet,
        images: updatedAdoption.pet.images ? JSON.parse(updatedAdoption.pet.images) : []
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error updating adoption status:', error);
    return NextResponse.json({
      error: 'Failed to update adoption status',
      code: 'UPDATE_ERROR',
      timestamp: new Date().toISOString(),
      path: `/api/adoptions/${params.id}`
    }, { status: 500 });
  }
}
