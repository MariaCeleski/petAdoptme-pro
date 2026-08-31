import { prisma } from '@/lib/prisma';

// GET all active sponsors (public)
export async function GET(request) {
  try {
    const sponsors = await prisma.sponsor.findMany({
      where: { isActive: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    return Response.json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return Response.json(
      { error: 'Failed to fetch sponsors', details: error.message },
      { status: 500 }
    );
  }
}

// POST create new sponsor (admin only)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, logo, website, description, isActive } = body;

    // Validate required fields
    if (!name || !logo) {
      return Response.json(
        { error: 'Name and logo are required' },
        { status: 400 }
      );
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        name,
        logo,
        website: website || null,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
        order: 0,
      },
    });

    return Response.json(sponsor, { status: 201 });
  } catch (error) {
    console.error('Error creating sponsor:', error);
    
    if (error.code === 'P2002') {
      return Response.json(
        { error: 'Sponsor with this name already exists' },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Failed to create sponsor', details: error.message },
      { status: 500 }
    );
  }
}
