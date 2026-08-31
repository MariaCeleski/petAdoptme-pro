import { prisma } from '@/lib/prisma';

// GET single sponsor
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const sponsor = await prisma.sponsor.findUnique({
      where: { id },
    });

    if (!sponsor) {
      return Response.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      );
    }

    return Response.json(sponsor);
  } catch (error) {
    console.error('Error fetching sponsor:', error);
    return Response.json(
      { error: 'Failed to fetch sponsor', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH update sponsor
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, logo, website, description, isActive, order } = body;

    // Check if sponsor exists
    const existingSponsor = await prisma.sponsor.findUnique({
      where: { id },
    });

    if (!existingSponsor) {
      return Response.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      );
    }

    const sponsor = await prisma.sponsor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(logo && { logo }),
        ...(website !== undefined && { website }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(order !== undefined && { order }),
      },
    });

    return Response.json(sponsor);
  } catch (error) {
    console.error('Error updating sponsor:', error);

    if (error.code === 'P2002') {
      return Response.json(
        { error: 'Sponsor name already exists' },
        { status: 400 }
      );
    }

    return Response.json(
      { error: 'Failed to update sponsor', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE sponsor
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    const sponsor = await prisma.sponsor.delete({
      where: { id },
    });

    return Response.json(sponsor);
  } catch (error) {
    console.error('Error deleting sponsor:', error);

    if (error.code === 'P2025') {
      return Response.json(
        { error: 'Sponsor not found' },
        { status: 404 }
      );
    }

    return Response.json(
      { error: 'Failed to delete sponsor', details: error.message },
      { status: 500 }
    );
  }
}
