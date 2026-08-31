import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import { sanitizeInput } from '@/lib/validation/sanitizers';

// Schema for profile update
const profileUpdateSchema = z.object({
  name: z.string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo')
    .refine(val => /^[a-zA-ZÀ-ÿ\s]+$/.test(val), 'Nome deve conter apenas letras e espaços')
    .transform(val => sanitizeInput(val, 'text'))
    .optional(),
  email: z.string()
    .email('Email inválido')
    .max(254, 'Email muito longo')
    .transform(val => sanitizeInput(val, 'email'))
    .optional(),
  phone: z.string()
    .min(10, 'Telefone deve ter pelo menos 10 dígitos')
    .max(20, 'Telefone muito longo')
    .refine(val => /^\+?[\d\s\-\(\)]{10,20}$/.test(val), 'Formato de telefone inválido')
    .transform(val => sanitizeInput(val, 'phone'))
    .optional()
    .nullable(),
  location: z.string()
    .max(100, 'Localização muito longa')
    .transform(val => sanitizeInput(val, 'text'))
    .optional()
    .nullable(),
  avatar: z.string()
    .url('Avatar URL deve ser válida')
    .optional()
    .nullable(),
});

/**
 * GET /api/users/profile
 * Get the authenticated user's profile information
 * Requirements: 7.4 (User_Dashboard SHALL allow editing of user profile information only for authenticated users)
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication (Requirement 7.4)
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/users/profile
 * Update the authenticated user's profile information
 * Requirements: 7.4 (User_Dashboard SHALL allow editing of user profile information only for authenticated users)
 */
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);

    // Check authentication (Requirement 7.4)
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validation = profileUpdateSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.error.format(),
        },
        { status: 400 }
      );
    }

    const updateData = validation.data;

    // If email is being updated, check if it's already taken
    if (updateData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (existingUser && existingUser.id !== session.user.id) {
        return NextResponse.json(
          {
            error: 'Email already in use',
            code: 'EMAIL_TAKEN',
          },
          { status: 409 }
        );
      }
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        type: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        message: 'Profile updated successfully',
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        {
          error: 'Email already in use',
          code: 'EMAIL_TAKEN',
        },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update profile', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
