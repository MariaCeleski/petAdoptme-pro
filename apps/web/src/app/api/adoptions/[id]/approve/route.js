import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

/**
 * PATCH /api/adoptions/[id]/approve
 * Approve adoption request (only for pet owners)
 * Requirements: 6.5 (approval), 6.6 (notification), 6.7 (update pet status)
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${params.id}/approve`
      }, { status: 401 });
    }

    const { id } = await params;

    // Get current adoption with pet and adopter info
    const adoption = await prisma.adoption.findUnique({
      where: { id },
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
        path: `/api/adoptions/${id}/approve`
      }, { status: 404 });
    }

    // Authorization check - only pet owner can approve
    if (adoption.pet.ownerId !== session.user.id) {
      return NextResponse.json({
        error: 'Only pet owner can approve adoption requests',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${id}/approve`
      }, { status: 403 });
    }

    // Validate current status - can only approve pending requests
    if (adoption.status !== 'PENDING') {
      return NextResponse.json({
        error: `Cannot approve adoption with status ${adoption.status}`,
        code: 'INVALID_STATUS',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${id}/approve`
      }, { status: 400 });
    }

    // Update adoption status to APPROVED
    const updatedAdoption = await prisma.adoption.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedAt: new Date()
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

    // Update pet status to PENDING (adoption in progress)
    await prisma.pet.update({
      where: { id: adoption.petId },
      data: { status: 'PENDING' }
    });

    // Send email notification to adopter
    try {
      const { sendAdoptionApprovedEmail } = await import('@/lib/email.js');
      await sendAdoptionApprovedEmail(adoption.adopter.email, {
        adopterName: adoption.adopter.name,
        petName: adoption.pet.name,
        petAge: adoption.pet.age || 'Não informada',
        petBreed: adoption.pet.breed || 'Não informada',
        ownerName: adoption.pet.owner.name,
        ownerPhone: 'Contactar via dashboard'
      });
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the request if email fails
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

    return NextResponse.json({
      message: 'Adoption approved successfully',
      adoption: responseData
    }, { status: 200 });
  } catch (error) {
    console.error('Error approving adoption:', error);
    return NextResponse.json({
      error: 'Failed to approve adoption',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: `/api/adoptions/[id]/approve`
    }, { status: 500 });
  }
}
