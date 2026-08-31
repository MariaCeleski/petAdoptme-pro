/**
 * Delete API route for removing images from Cloudinary
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

import { 
  deleteFromCloudinary, 
  deleteMultipleImages,
  extractPublicId 
} from '@/lib/cloudinary.js';

import { 
  deleteImage,
  deleteMultipleImagesByUrl,
  UploadError
} from '@/lib/upload/utils.js';

/**
 * DELETE /api/upload/delete - Delete single or multiple images
 */
export async function DELETE(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { 
          error: 'Não autorizado',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { publicIds, urls, publicId, url } = body;

    // Validate request data
    if (!publicIds && !urls && !publicId && !url) {
      return NextResponse.json(
        { 
          error: 'ID público ou URL da imagem é obrigatório',
          code: 'MISSING_IDENTIFIER' 
        },
        { status: 400 }
      );
    }

    let result;

    // Handle multiple deletions
    if (publicIds || urls) {
      const identifiers = publicIds || urls;
      
      if (!Array.isArray(identifiers) || identifiers.length === 0) {
        return NextResponse.json(
          { 
            error: 'Array de identificadores inválido',
            code: 'INVALID_IDENTIFIERS' 
          },
          { status: 400 }
        );
      }

      if (urls) {
        // Delete by URLs
        result = await deleteMultipleImagesByUrl(urls);
      } else {
        // Delete by public IDs
        const deleteResults = await deleteMultipleImages(identifiers);
        
        result = {
          success: true,
          results: deleteResults,
          totalDeleted: deleteResults.filter(r => r.success).length,
          totalFailed: deleteResults.filter(r => !r.success).length
        };
      }

      // Log deletion
      console.log(`Multiple images deleted by user ${session.user.id}:`, {
        total: identifiers.length,
        deleted: result.totalDeleted,
        failed: result.totalFailed
      });

    } else {
      // Handle single deletion
      const identifier = publicId || url;
      
      if (url) {
        // Delete by URL
        result = await deleteImage(url);
      } else {
        // Delete by public ID
        const deleteResult = await deleteFromCloudinary(identifier);
        
        result = {
          success: deleteResult.result === 'ok',
          publicId: identifier,
          result: deleteResult
        };
      }

      // Log deletion
      console.log(`Image deleted by user ${session.user.id}:`, {
        identifier,
        success: result.success
      });
    }

    return NextResponse.json({
      ...result,
      deletedBy: session.user.id,
      deletedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Delete API error:', error);

    // Handle specific error types
    if (error instanceof UploadError) {
      return NextResponse.json(
        { 
          error: error.message,
          code: error.code,
          details: error.details 
        },
        { status: 400 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor durante exclusão',
        code: 'INTERNAL_ERROR',
        details: error.message
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/upload/delete - Alternative endpoint for delete operations
 * Some clients prefer POST for complex delete operations
 */
export async function POST(request) {
  return DELETE(request);
}