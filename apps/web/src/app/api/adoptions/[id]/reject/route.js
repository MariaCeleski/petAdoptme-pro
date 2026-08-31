import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

/**
 * PATCH /api/adoptions/[id]/reject
 * Reject adoption request (only for pet owners)
 * Requirements: 6.5 (rejection), 6.6 (notification), 6.7 (update pet status)
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${params.id}/reject`
      }, { status: 401 });
    }

    const { id } = await params;
    const requestData = await request.json();
    const { rejectionReason } = requestData;

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
        path: `/api/adoptions/${id}/reject`
      }, { status: 404 });
    }

    // Authorization check - only pet owner can reject
    if (adoption.pet.ownerId !== session.user.id) {
      return NextResponse.json({
        error: 'Only pet owner can reject adoption requests',
        code: 'FORBIDDEN',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${id}/reject`
      }, { status: 403 });
    }

    // Validate current status - can only reject pending requests
    if (adoption.status !== 'PENDING') {
      return NextResponse.json({
        error: `Cannot reject adoption with status ${adoption.status}`,
        code: 'INVALID_STATUS',
        timestamp: new Date().toISOString(),
        path: `/api/adoptions/${id}/reject`
      }, { status: 400 });
    }

    // Update adoption status to REJECTED
    const updatedAdoption = await prisma.adoption.update({
      where: { id },
      data: {
        status: 'REJECTED',
        rejectionReason: rejectionReason || null
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

    // Update pet status back to AVAILABLE
    await prisma.pet.update({
      where: { id: adoption.petId },
      data: { status: 'APPROVED' }
    });

    // Send email notification to adopter
    try {
      const { sendAdoptionRejectedEmail } = await import('@/lib/email.js');
      await sendAdoptionRejectedEmail(adoption.adopter.email, {
        adopterName: adoption.adopter.name,
        petName: adoption.pet.name,
        rejectionReason: rejectionReason || 'Não informado'
      });
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
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
      message: 'Adoption rejected successfully',
      adoption: responseData
    }, { status: 200 });
  } catch (error) {
    console.error('Error rejecting adoption:', error);
    return NextResponse.json({
      error: 'Failed to reject adoption',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      path: `/api/adoptions/[id]/reject`
    }, { status: 500 });
  }
}
