import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma.js';
import { shelterSchema } from '@/lib/validation/schemas.js';
import { authOptions } from '@/lib/auth.js';

/**
 * GET /api/shelters/[id]
 * Fetch a specific shelter by ID (public endpoint)
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

    // Fetch shelter
    const shelter = await prisma.shelter.findUnique({
      where: { id },
      include: {
        admin: {
          select: { id: true, name: true }
        },
        pets: {
          where: { status: 'APPROVED' },
          select: { id: true }
        }
      }
    });

    if (!shelter) {
      return NextResponse.json(
        { error: 'Abrigo não encontrado' },
        { status: 404 }
      );
    }

    // Calculate adoption statistics
    const adoptions = await prisma.adoption.groupBy({
      by: ['petId'],
      where: {
        pet: { shelterId: id },
        status: 'COMPLETED'
      }
    });

    const totalPets = await prisma.pet.count({
      where: { shelterId: id }
    });

    const adoptedCount = adoptions.length;
    const adoptionRate = totalPets > 0 ? Math.round((adoptedCount / totalPets) * 100) : 0;

    // Transform response
    return NextResponse.json({
      id: shelter.id,
      name: shelter.name,
      address: shelter.address,
      city: shelter.city,
      state: shelter.state,
      zipCode: shelter.zipCode,
      phone: shelter.phone,
      email: shelter.email,
      website: shelter.website,
      description: shelter.description,
      logo: shelter.logo,
      images: JSON.parse(shelter.images),
      isVerified: shelter.isVerified,
      adminId: shelter.adminId,
      admin: shelter.admin,
      availablePetsCount: shelter.pets.length,
      adoptionStats: {
        totalPets,
        adoptedCount,
        adoptionRate,
        availableCount: shelter.pets.length
      },
      createdAt: shelter.createdAt,
      updatedAt: shelter.updatedAt
    });

  } catch (error) {
    console.error('Error fetching shelter:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar abrigo' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/shelters/[id]
 * Update shelter information
 * Requires authentication and authorization (must be the shelter admin)
 */
export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Fetch shelter to check authorization
    const shelter = await prisma.shelter.findUnique({
      where: { id },
      select: { adminId: true }
    });

    if (!shelter) {
      return NextResponse.json(
        { error: 'Abrigo não encontrado' },
        { status: 404 }
      );
    }

    // Check authorization
    if (shelter.adminId !== session.user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para editar este abrigo' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validation = shelterSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.errors.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return NextResponse.json(
        { error: 'Validação falhou', details: errors },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Update shelter
    const updatedShelter = await prisma.shelter.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        phone: data.phone,
        email: data.email,
        website: data.website || null,
        description: data.description || null,
        logo: data.logo || null,
        images: JSON.stringify(data.images || [])
      },
      include: {
        admin: {
          select: { id: true, name: true }
        }
      }
    });

    // Transform response
    return NextResponse.json({
      id: updatedShelter.id,
      name: updatedShelter.name,
      address: updatedShelter.address,
      city: updatedShelter.city,
      state: updatedShelter.state,
      zipCode: updatedShelter.zipCode,
      phone: updatedShelter.phone,
      email: updatedShelter.email,
      website: updatedShelter.website,
      description: updatedShelter.description,
      logo: updatedShelter.logo,
      images: JSON.parse(updatedShelter.images),
      isVerified: updatedShelter.isVerified,
      adminId: updatedShelter.adminId,
      admin: updatedShelter.admin,
      createdAt: updatedShelter.createdAt,
      updatedAt: updatedShelter.updatedAt
    });

  } catch (error) {
    console.error('Error updating shelter:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar abrigo' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/shelters/[id]
 * Delete shelter (soft delete - archive)
 * Requires authentication and authorization
 * Note: Implementation deferred - requires careful handling of associated data
 */
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = params;

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    // Validate ID format
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'ID inválido' },
        { status: 400 }
      );
    }

    // Fetch shelter to check authorization
    const shelter = await prisma.shelter.findUnique({
      where: { id },
      select: { adminId: true, pets: { select: { id: true } } }
    });

    if (!shelter) {
      return NextResponse.json(
        { error: 'Abrigo não encontrado' },
        { status: 404 }
      );
    }

    // Check authorization
    if (shelter.adminId !== session.user.id) {
      return NextResponse.json(
        { error: 'Você não tem permissão para deletar este abrigo' },
        { status: 403 }
      );
    }

    // Check if shelter has associated pets
    if (shelter.pets.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar abrigo com pets associados. Atualize os pets primeiro.' },
        { status: 400 }
      );
    }

    // Delete shelter
    await prisma.shelter.delete({
      where: { id }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Error deleting shelter:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar abrigo' },
      { status: 500 }
    );
  }
}
