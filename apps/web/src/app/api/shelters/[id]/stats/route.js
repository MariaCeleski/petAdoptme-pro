import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.js';

/**
 * GET /api/shelters/[id]/stats
 * Get adoption statistics for a specific shelter
 * Public endpoint - Requirement 11.6
 */
export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verify shelter exists
    const shelter = await prisma.shelter.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!shelter) {
      return NextResponse.json(
        { error: 'Abrigo não encontrado' },
        { status: 404 }
      );
    }

    // Get adoption statistics
    const [
      totalPets,
      availablePets,
      pendingPets,
      adoptedPets,
      adoptions
    ] = await Promise.all([
      // Total pets
      prisma.pet.count({
        where: { shelterId: id }
      }),
      // Available pets
      prisma.pet.count({
        where: { shelterId: id, status: 'APPROVED' }
      }),
      // Pending adoptions
      prisma.pet.count({
        where: { shelterId: id, status: 'PENDING' }
      }),
      // Adopted pets
      prisma.pet.count({
        where: { shelterId: id, status: 'ADOPTED' }
      }),
      // Adoption records
      prisma.adoption.findMany({
        where: {
          pet: { shelterId: id }
        },
        select: {
          status: true,
          createdAt: true,
          approvedAt: true,
          completedAt: true
        }
      })
    ]);

    const completedAdoptions = adoptions.filter(a => a.status === 'COMPLETED').length;
    const pendingAdoptions = adoptions.filter(a => a.status === 'PENDING').length;
    const approvedAdoptions = adoptions.filter(a => a.status === 'APPROVED').length;
    const rejectedAdoptions = adoptions.filter(a => a.status === 'REJECTED').length;

    // Calculate average adoption time for completed adoptions
    let averageAdoptionDays = 0;
    const completedAdoptionTimes = adoptions
      .filter(a => a.status === 'COMPLETED' && a.createdAt && a.completedAt)
      .map(a => (new Date(a.completedAt) - new Date(a.createdAt)) / (1000 * 60 * 60 * 24));

    if (completedAdoptionTimes.length > 0) {
      averageAdoptionDays = Math.round(
        completedAdoptionTimes.reduce((a, b) => a + b, 0) / completedAdoptionTimes.length
      );
    }

    // Calculate adoption rate
    const adoptionRate = totalPets > 0 ? Math.round((adoptedPets / totalPets) * 100) : 0;

    // Calculate success rate (approved + completed / total adoption requests)
    const totalAdoptionRequests = adoptions.length;
    const successfulAdoptions = completedAdoptions + approvedAdoptions;
    const successRate = totalAdoptionRequests > 0 
      ? Math.round((successfulAdoptions / totalAdoptionRequests) * 100) 
      : 0;

    return NextResponse.json({
      shelterId: id,
      petStats: {
        total: totalPets,
        available: availablePets,
        pending: pendingPets,
        adopted: adoptedPets,
        adoptionRate: adoptionRate
      },
      adoptionStats: {
        totalRequests: totalAdoptionRequests,
        pending: pendingAdoptions,
        approved: approvedAdoptions,
        completed: completedAdoptions,
        rejected: rejectedAdoptions,
        successRate: successRate,
        averageAdoptionDays: averageAdoptionDays
      },
      summary: {
        totalPets,
        adoptedPets,
        adoptionRate,
        averageAdoptionTime: `${averageAdoptionDays} dias`,
        successRate
      }
    });

  } catch (error) {
    console.error('Error fetching shelter stats:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas do abrigo' },
      { status: 500 }
    );
  }
}
