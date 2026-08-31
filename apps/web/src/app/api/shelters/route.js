import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma.js';
import { shelterSchema } from '@/lib/validation/schemas.js';
import { authOptions } from '@/lib/auth.js';

/**
 * GET /api/shelters
 * Fetch all shelters (public endpoint)
 * Can be filtered by various parameters
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const adminId = searchParams.get('adminId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12')));
    const skip = (page - 1) * limit;

    // Build query filters
    const whereClause = {
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(adminId && { adminId })
    };

    // Fetch shelters with pagination
    const [shelters, total] = await Promise.all([
      prisma.shelter.findMany({
        where: whereClause,
        include: {
          admin: {
            select: { id: true, name: true, email: true }
          },
          pets: {
            where: { status: 'APPROVED' },
            select: { id: true }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.shelter.count({ where: whereClause })
    ]);

    // Transform response
    const transformedShelters = shelters.map(shelter => ({
      ...shelter,
      images: shelter.images ? JSON.parse(shelter.images) : [],
      availablePetsCount: shelter.pets.length,
      pets: undefined // Remove pets array
    }));

    return NextResponse.json({
      data: transformedShelters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching shelters:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar abrigos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/shelters
 * Create a new shelter profile
 * Requires authentication and SHELTER_ADMIN user type
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication
    if (!session) {
      return NextResponse.json(
        { error: 'Autenticação necessária' },
        { status: 401 }
      );
    }

    // Check user type
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user || user.type !== 'SHELTER_ADMIN') {
      return NextResponse.json(
        { error: 'Apenas administradores de abrigo podem criar perfis' },
        { status: 403 }
      );
    }

    // Check if shelter already exists for this admin
    const existingShelter = await prisma.shelter.findUnique({
      where: { adminId: session.user.id }
    });

    if (existingShelter) {
      return NextResponse.json(
        { error: 'Este usuário já possui um perfil de abrigo' },
        { status: 400 }
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

    // Create shelter
    const shelter = await prisma.shelter.create({
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
        images: JSON.stringify(data.images || []),
        isVerified: false,
        admin: {
          connect: { id: session.user.id }
        }
      },
      include: {
        admin: {
          select: { id: true, name: true, email: true }
        }
      }
    });

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
      createdAt: shelter.createdAt
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating shelter:', error);
    return NextResponse.json(
      { error: 'Erro ao criar perfil do abrigo' },
      { status: 500 }
    );
  }
}
