/**
 * GET /api/adopters/search-preferences
 * POST /api/adopters/search-preferences
 * 
 * Manage adopter search preferences for pet matching alerts
 * Requirements: 10.6 (save search preferences), 8.3 (pet matching alerts)
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { saveAdopterSearchPreferences } from '@/lib/pet-matching';
import { z } from 'zod';

// Validation schema for search preferences
const searchPreferenceSchema = z.object({
  species: z.enum(['DOG', 'CAT']).optional(),
  sizePreferences: z.array(z.enum(['SMALL', 'MEDIUM', 'LARGE'])).optional(),
  minAge: z.string().optional(),
  maxAge: z.string().optional(),
  genderPreference: z.enum(['MALE', 'FEMALE']).optional(),
  personalityTraits: z.array(z.string()).optional(),
  location: z.string().optional(),
  searchRadius: z.number().optional(),
  isActive: z.boolean().default(true)
});

/**
 * GET - Retrieve adopter's search preferences
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }
    
    // Only adopters can retrieve preferences
    if (session.user.type !== 'ADOPTER') {
      return NextResponse.json({
        error: 'Only adopters can manage search preferences',
        code: 'FORBIDDEN'
      }, { status: 403 });
    }
    
    const preferences = await prisma.adopterSearchPreference.findUnique({
      where: { userId: session.user.id }
    });
    
    if (!preferences) {
      return NextResponse.json({
        preferences: null,
        message: 'No search preferences found. Create some to get matching pet alerts!'
      });
    }
    
    // Parse JSON fields
    const parsedPreferences = {
      ...preferences,
      sizePreferences: preferences.sizePreferences 
        ? JSON.parse(preferences.sizePreferences) 
        : [],
      personalityTraits: preferences.personalityTraits 
        ? JSON.parse(preferences.personalityTraits) 
        : []
    };
    
    return NextResponse.json({
      preferences: parsedPreferences
    });
  } catch (error) {
    console.error('Error fetching search preferences:', error);
    return NextResponse.json({
      error: 'Failed to fetch search preferences',
      code: 'FETCH_ERROR'
    }, { status: 500 });
  }
}

/**
 * POST - Save or update adopter's search preferences
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }
    
    // Only adopters can save preferences
    if (session.user.type !== 'ADOPTER') {
      return NextResponse.json({
        error: 'Only adopters can manage search preferences',
        code: 'FORBIDDEN'
      }, { status: 403 });
    }
    
    const requestData = await request.json();
    
    // Validate request data
    const validation = searchPreferenceSchema.safeParse(requestData);
    if (!validation.success) {
      return NextResponse.json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.error.format()
      }, { status: 400 });
    }
    
    const validatedData = validation.data;
    
    // Save preferences
    const savedPreferences = await saveAdopterSearchPreferences(
      session.user.id,
      validatedData
    );
    
    // Parse JSON fields for response
    const responseData = {
      ...savedPreferences,
      sizePreferences: savedPreferences.sizePreferences 
        ? JSON.parse(savedPreferences.sizePreferences) 
        : [],
      personalityTraits: savedPreferences.personalityTraits 
        ? JSON.parse(savedPreferences.personalityTraits) 
        : []
    };
    
    console.log(`[PREFERENCES] Adopter ${session.user.id} updated search preferences`);
    
    return NextResponse.json({
      success: true,
      message: 'Search preferences saved successfully!',
      preferences: responseData
    }, { status: 201 });
  } catch (error) {
    console.error('Error saving search preferences:', error);
    return NextResponse.json({
      error: 'Failed to save search preferences',
      code: 'SAVE_ERROR'
    }, { status: 500 });
  }
}

/**
 * PATCH - Disable notifications for search preferences
 */
export async function PATCH(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({
        error: 'Authentication required',
        code: 'UNAUTHORIZED'
      }, { status: 401 });
    }
    
    // Only adopters can manage preferences
    if (session.user.type !== 'ADOPTER') {
      return NextResponse.json({
        error: 'Only adopters can manage search preferences',
        code: 'FORBIDDEN'
      }, { status: 403 });
    }
    
    const { isActive } = await request.json();
    
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({
        error: 'isActive must be a boolean',
        code: 'VALIDATION_ERROR'
      }, { status: 400 });
    }
    
    const updatedPreferences = await prisma.adopterSearchPreference.update({
      where: { userId: session.user.id },
      data: { isActive }
    });
    
    const action = isActive ? 'enabled' : 'disabled';
    console.log(`[PREFERENCES] Adopter ${session.user.id} ${action} search preferences notifications`);
    
    return NextResponse.json({
      success: true,
      message: `Search preference notifications ${action}`,
      isActive: updatedPreferences.isActive
    });
  } catch (error) {
    console.error('Error updating search preferences:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json({
        error: 'Search preferences not found',
        code: 'NOT_FOUND'
      }, { status: 404 });
    }
    
    return NextResponse.json({
      error: 'Failed to update search preferences',
      code: 'UPDATE_ERROR'
    }, { status: 500 });
  }
}
