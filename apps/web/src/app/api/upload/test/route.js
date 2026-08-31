/**
 * Test API route for Cloudinary service functionality
 * This endpoint allows testing of the upload service without UI
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

import { 
  healthCheck,
  validateFile,
  IMAGE_CONSTANTS,
  getPetImageUrls,
  getAvatarUrls,
  extractPublicId
} from '@/lib/cloudinary.js';

import { 
  validateImageFile,
  formatFileSize,
  sanitizeFilename,
  generateUniqueFilename
} from '@/lib/upload/validation.js';

/**
 * GET /api/upload/test - Test Cloudinary service functionality
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const testType = searchParams.get('type') || 'all';

    let results = {};

    // Test Cloudinary configuration
    if (testType === 'all' || testType === 'config') {
      results.configTest = await healthCheck();
    }

    // Test validation functions
    if (testType === 'all' || testType === 'validation') {
      results.validationTest = {
        constants: IMAGE_CONSTANTS,
        fileValidation: {
          validFile: validateFile(Buffer.from('test'), {
            name: 'test.jpg',
            size: 1024,
            type: 'image/jpeg'
          }),
          invalidFile: validateFile(Buffer.from('test'), {
            name: 'test.txt',
            size: 10 * 1024 * 1024, // 10MB
            type: 'text/plain'
          })
        },
        utilityFunctions: {
          formatFileSize: {
            bytes: formatFileSize(1024),
            kilobytes: formatFileSize(1024 * 1024),
            megabytes: formatFileSize(5 * 1024 * 1024)
          },
          sanitizeFilename: {
            original: 'My Pet Photo!@#$%^&*()_+.jpg',
            sanitized: sanitizeFilename('My Pet Photo!@#$%^&*()_+.jpg')
          },
          generateUniqueFilename: {
            example1: generateUniqueFilename('pet.jpg'),
            example2: generateUniqueFilename('avatar.png', 'user_')
          }
        }
      };
    }

    // Test URL generation functions
    if (testType === 'all' || testType === 'urls') {
      const testPublicId = 'petadopt/pets/sample_pet_image';
      
      results.urlTest = {
        petImageUrls: getPetImageUrls(testPublicId),
        avatarUrls: getAvatarUrls('petadopt/avatars/sample_avatar'),
        extractPublicId: {
          validUrl: extractPublicId('https://res.cloudinary.com/demo/image/upload/v1234567890/petadopt/pets/sample_pet_image.jpg'),
          invalidUrl: extractPublicId('https://example.com/invalid.jpg')
        }
      };
    }

    // Test error scenarios
    if (testType === 'all' || testType === 'errors') {
      results.errorTest = {
        fileTooLarge: validateFile(Buffer.from('test'), {
          name: 'large.jpg',
          size: 10 * 1024 * 1024, // 10MB
          type: 'image/jpeg'
        }),
        invalidFormat: validateFile(Buffer.from('test'), {
          name: 'document.pdf',
          size: 1024,
          type: 'application/pdf'
        }),
        missingName: validateFile(Buffer.from('test'), {
          name: '',
          size: 1024,
          type: 'image/jpeg'
        })
      };
    }

    return NextResponse.json({
      success: true,
      testType,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('Test API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'TEST_ERROR'
    }, { status: 500 });
  }
}

/**
 * POST /api/upload/test - Test upload functionality with sample data
 */
export async function POST(request) {
  try {
    // Check authentication for write operations
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { 
          error: 'Não autorizado - testes de upload requerem autenticação',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { testType = 'validation', sampleData } = body;

    let results = {};

    // Test validation with sample data
    if (testType === 'validation' && sampleData) {
      const { files } = sampleData;
      
      results.validationResults = files?.map((file, index) => ({
        index,
        file,
        validation: validateImageFile({
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: Date.now()
        })
      })) || [];
    }

    // Test batch validation
    if (testType === 'batch-validation' && sampleData) {
      const { files, maxFiles = 10 } = sampleData;
      
      results.batchValidation = {
        fileCount: files?.length || 0,
        maxFiles,
        isValidCount: (files?.length || 0) <= maxFiles,
        individualValidations: files?.map(file => validateImageFile(file)) || []
      };
    }

    return NextResponse.json({
      success: true,
      testType,
      userId: session.user.id,
      timestamp: new Date().toISOString(),
      results
    });

  } catch (error) {
    console.error('Test POST API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message,
      code: 'TEST_POST_ERROR'
    }, { status: 500 });
  }
}