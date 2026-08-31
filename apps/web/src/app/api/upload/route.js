/**
 * Upload API route for handling image uploads to Cloudinary
 * Supports single and multiple file uploads with robust validation
 * Requirements: 3.1, 3.4, 12.2
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

import { 
  uploadPetImage, 
  uploadAvatar, 
  validateFile, 
  IMAGE_CONSTANTS 
} from '@/lib/cloudinary.js';

import { 
  processPetImageUpload,
  processAvatarUpload,
  processMultiplePetImageUploads,
  UploadError,
  UPLOAD_ERROR_CODES
} from '@/lib/upload/utils.js';

import { 
  isValidImageBuffer,
  validateImageFile,
  validateMultipleImageFiles
} from '@/lib/upload/validation.js';

import { 
  imageUploadSchema, 
  petImageUploadSchema, 
  avatarUploadSchema 
} from '@/lib/validation/schemas.js';

// Enhanced rate limiting with different limits per upload type
const uploadAttempts = new Map();
const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 60 * 1000, // 1 minute
  LIMITS: {
    pet: { max: 15, window: 60 * 1000 }, // 15 pet uploads per minute
    avatar: { max: 5, window: 60 * 1000 }, // 5 avatar uploads per minute
    general: { max: 20, window: 60 * 1000 } // 20 general uploads per minute
  },
  DAILY_LIMITS: {
    pet: 100, // 100 pet images per day
    avatar: 10, // 10 avatar changes per day
    general: 150 // 150 total uploads per day
  }
};

// Daily upload tracking
const dailyUploadAttempts = new Map();

/**
 * Enhanced rate limiting check with type-specific limits
 */
function checkRateLimit(userId, uploadType = 'general') {
  const now = Date.now();
  const limits = RATE_LIMIT_CONFIG.LIMITS[uploadType] || RATE_LIMIT_CONFIG.LIMITS.general;
  
  // Check per-minute rate limiting
  const userAttempts = uploadAttempts.get(userId) || [];
  const recentAttempts = userAttempts.filter(time => now - time < limits.window);
  
  if (recentAttempts.length >= limits.max) {
    return {
      allowed: false,
      reason: 'RATE_LIMIT_EXCEEDED',
      resetTime: Math.max(...recentAttempts) + limits.window,
      remaining: 0
    };
  }
  
  // Check daily limits
  const today = new Date().toDateString();
  const dailyKey = `${userId}_${today}`;
  const dailyAttempts = dailyUploadAttempts.get(dailyKey) || { count: 0, types: {} };
  
  const dailyLimit = RATE_LIMIT_CONFIG.DAILY_LIMITS[uploadType] || RATE_LIMIT_CONFIG.DAILY_LIMITS.general;
  const dailyCount = dailyAttempts.types[uploadType] || 0;
  
  if (dailyCount >= dailyLimit) {
    return {
      allowed: false,
      reason: 'DAILY_LIMIT_EXCEEDED',
      resetTime: new Date().setHours(24, 0, 0, 0),
      remaining: 0
    };
  }
  
  // Update attempts
  recentAttempts.push(now);
  uploadAttempts.set(userId, recentAttempts);
  
  // Update daily attempts
  dailyAttempts.count++;
  dailyAttempts.types[uploadType] = (dailyAttempts.types[uploadType] || 0) + 1;
  dailyUploadAttempts.set(dailyKey, dailyAttempts);
  
  return {
    allowed: true,
    remaining: limits.max - recentAttempts.length,
    dailyRemaining: dailyLimit - dailyAttempts.types[uploadType]
  };
}

/**
 * Validate request body size and content type
 */
function validateRequest(request) {
  const contentType = request.headers.get('content-type');
  
  // Check if it's multipart form data
  if (!contentType || !contentType.includes('multipart/form-data')) {
    return {
      valid: false,
      error: 'Content-Type deve ser multipart/form-data',
      code: 'INVALID_CONTENT_TYPE'
    };
  }
  
  return { valid: true };
}

/**
 * Enhanced file validation with buffer inspection
 */
async function validateUploadedFile(file, index = 0) {
  try {
    // Basic validation
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      return {
        valid: false,
        errors: validation.errors,
        fileIndex: index
      };
    }

    // Convert to buffer for deeper validation
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Validate buffer content
    if (!isValidImageBuffer(buffer)) {
      return {
        valid: false,
        errors: ['Dados de imagem corrompidos ou formato não suportado'],
        fileIndex: index
      };
    }

    // Additional security checks
    const suspicious = checkSuspiciousFile(buffer, file.name);
    if (!suspicious.safe) {
      return {
        valid: false,
        errors: [suspicious.reason],
        fileIndex: index
      };
    }

    return {
      valid: true,
      buffer,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      }
    };
    
  } catch (error) {
    return {
      valid: false,
      errors: [`Erro ao processar arquivo: ${error.message}`],
      fileIndex: index
    };
  }
}

/**
 * Check for suspicious file content
 */
function checkSuspiciousFile(buffer, filename) {
  // Check for executable signatures
  const executableSignatures = [
    [0x4D, 0x5A], // PE executable
    [0x7F, 0x45, 0x4C, 0x46], // ELF executable
    [0xFE, 0xED, 0xFA], // Mach-O executable
  ];
  
  for (const signature of executableSignatures) {
    if (buffer.length >= signature.length) {
      const matches = signature.every((byte, i) => buffer[i] === byte);
      if (matches) {
        return {
          safe: false,
          reason: 'Arquivo executável não permitido'
        };
      }
    }
  }
  
  // Check filename for suspicious patterns
  const suspiciousExtensions = /\.(exe|bat|cmd|scr|pif|com|vbs|js|jar|app|dmg)$/i;
  if (suspiciousExtensions.test(filename)) {
    return {
      safe: false,
      reason: 'Extensão de arquivo não permitida'
    };
  }
  
  return { safe: true };
}

/**
 * POST /api/upload - Handle file uploads with enhanced validation and error handling
 */
export async function POST(request) {
  let uploadType = 'general';
  
  try {
    // Validate request format
    const requestValidation = validateRequest(request);
    if (!requestValidation.valid) {
      return NextResponse.json(
        { 
          error: requestValidation.error,
          code: requestValidation.code 
        },
        { status: 400 }
      );
    }

    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { 
          error: 'Não autorizado. Faça login para fazer upload de imagens.',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }

    // Parse form data with error handling
    let formData;
    try {
      formData = await request.formData();
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Dados do formulário inválidos ou corrompidos',
          code: 'FORM_DATA_ERROR' 
        },
        { status: 400 }
      );
    }

    const files = formData.getAll('files');
    uploadType = formData.get('type') || 'pet'; // 'pet' or 'avatar'
    const petId = formData.get('petId');
    const maxFiles = parseInt(formData.get('maxFiles')) || (uploadType === 'avatar' ? 1 : 10);

    // Validate Zod schema based on upload type
    try {
      if (uploadType === 'avatar') {
        await avatarUploadSchema.parseAsync({
          file: files[0] ? {
            name: files[0].name,
            size: files[0].size,
            type: files[0].type
          } : null,
          userId: session.user.id
        });
      } else {
        await petImageUploadSchema.parseAsync({
          files: files.map(file => ({
            name: file.name,
            size: file.size,
            type: file.type
          })),
          petId: petId || undefined,
          ownerId: session.user.id
        });
      }
    } catch (zodError) {
      return NextResponse.json(
        { 
          error: 'Dados de upload inválidos',
          code: 'VALIDATION_ERROR',
          details: zodError.errors?.map(e => e.message) || ['Erro de validação']
        },
        { status: 400 }
      );
    }

    // Check rate limiting with upload type
    const rateLimitCheck = checkRateLimit(session.user.id, uploadType);
    if (!rateLimitCheck.allowed) {
      const resetTime = new Date(rateLimitCheck.resetTime);
      
      return NextResponse.json(
        { 
          error: rateLimitCheck.reason === 'DAILY_LIMIT_EXCEEDED' 
            ? 'Limite diário de uploads excedido. Tente novamente amanhã.'
            : 'Muitas tentativas de upload. Tente novamente em alguns minutos.',
          code: rateLimitCheck.reason,
          resetTime: resetTime.toISOString(),
          remaining: rateLimitCheck.remaining
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.LIMITS[uploadType]?.max.toString() || '20',
            'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
            'X-RateLimit-Reset': rateLimitCheck.resetTime.toString(),
            'Retry-After': Math.ceil((rateLimitCheck.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    // Validate request files
    if (!files || files.length === 0) {
      return NextResponse.json(
        { 
          error: 'Nenhum arquivo fornecido',
          code: 'NO_FILES' 
        },
        { status: 400 }
      );
    }

    // Check file count
    if (files.length > maxFiles) {
      return NextResponse.json(
        { 
          error: `Máximo ${maxFiles} arquivos por vez`,
          code: 'TOO_MANY_FILES' 
        },
        { status: 400 }
      );
    }

    // Process uploads based on type with enhanced error handling
    let result;

    if (uploadType === 'avatar') {
      result = await processEnhancedAvatarUpload(files[0], session.user.id);
    } else {
      result = await processEnhancedMultiplePetImagesUpload(files, {
        petId,
        userId: session.user.id,
        maxFiles
      });
    }

    // Add rate limit info to successful response
    result.rateLimit = {
      remaining: rateLimitCheck.remaining,
      dailyRemaining: rateLimitCheck.dailyRemaining,
      resetTime: new Date(Date.now() + RATE_LIMIT_CONFIG.LIMITS[uploadType].window).toISOString()
    };

    // Log successful upload
    console.log(`Upload completed for user ${session.user.id}:`, {
      type: uploadType,
      files: files.length,
      success: result.success,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Limit': RATE_LIMIT_CONFIG.LIMITS[uploadType]?.max.toString() || '20',
        'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
        'X-RateLimit-Reset': (Date.now() + RATE_LIMIT_CONFIG.LIMITS[uploadType].window).toString()
      }
    });

  } catch (error) {
    console.error('Upload API error:', error);

    // Log error for monitoring
    console.error(`Upload error for user ${session?.user?.id || 'unknown'}:`, {
      error: error.message,
      type: uploadType,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

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

    // Handle Cloudinary errors
    if (error.message?.includes('Cloudinary')) {
      return NextResponse.json(
        { 
          error: 'Erro no serviço de upload. Tente novamente.',
          code: 'CLOUDINARY_ERROR' 
        },
        { status: 503 }
      );
    }

    // Handle file size errors
    if (error.message?.includes('size') || error.message?.includes('large')) {
      return NextResponse.json(
        { 
          error: 'Arquivo muito grande. Tamanho máximo: 5MB por imagem.',
          code: 'FILE_TOO_LARGE' 
        },
        { status: 413 }
      );
    }

    // Generic server error
    return NextResponse.json(
      { 
        error: 'Erro interno do servidor durante upload',
        code: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    );
  }
}

/**
 * Enhanced avatar upload processing
 */
async function processEnhancedAvatarUpload(file, userId) {
  const validation = await validateUploadedFile(file, 0);
  if (!validation.valid) {
    throw new UploadError(
      validation.errors.join(', '),
      'VALIDATION_ERROR',
      validation.errors
    );
  }

  const uploadResult = await uploadAvatar(validation.buffer, {
    public_id: `avatar_${userId}_${Date.now()}`,
    tags: ['avatar', 'profile', userId],
    context: {
      uploaded_by: userId,
      upload_type: 'avatar',
      original_name: file.name
    }
  });

  return {
    success: true,
    type: 'avatar',
    upload: uploadResult,
    file: validation.fileInfo,
    urls: {
      main: uploadResult.avatar_url,
      small: uploadResult.avatar_small_url,
      original: uploadResult.secure_url
    }
  };
}

/**
 * Enhanced multiple pet images upload processing
 */
async function processEnhancedMultiplePetImagesUpload(files, options) {
  const { petId, userId, maxFiles } = options;
  
  // Validate all files first
  const validationResults = await Promise.all(
    Array.from(files).map((file, index) => validateUploadedFile(file, index))
  );

  // Check if any files failed validation
  const validationErrors = validationResults
    .filter(result => !result.valid)
    .flatMap(result => result.errors.map(error => `Arquivo ${result.fileIndex + 1}: ${error}`));

  if (validationErrors.length > 0) {
    throw new UploadError(
      validationErrors.join(', '),
      'VALIDATION_ERROR',
      validationErrors
    );
  }

  // Process uploads
  const uploadPromises = validationResults.map(async (validation, index) => {
    try {
      const uploadResult = await uploadPetImage(validation.buffer, {
        public_id: petId 
          ? `pet_${petId}_${Date.now()}_${index}` 
          : `pet_${userId}_${Date.now()}_${index}`,
        tags: ['pet', 'upload', userId, ...(petId ? [petId] : [])],
        context: {
          uploaded_by: userId,
          upload_type: 'pet_image',
          original_name: validation.fileInfo.name,
          pet_id: petId || null,
          batch_id: `${Date.now()}`
        }
      });

      return {
        success: true,
        file: validation.fileInfo,
        upload: uploadResult,
        urls: {
          main: uploadResult.optimized_url,
          thumbnail: uploadResult.thumbnail_url,
          card: uploadResult.card_url,
          original: uploadResult.secure_url
        },
        index
      };

    } catch (error) {
      console.error(`Upload error for file ${index}:`, error);
      
      return {
        success: false,
        file: validation.fileInfo,
        error: error.message,
        code: error.code || 'UPLOAD_ERROR',
        index
      };
    }
  });

  const uploadResults = await Promise.allSettled(uploadPromises);
  
  // Process results
  const successful = [];
  const failed = [];

  uploadResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      if (result.value.success) {
        successful.push(result.value);
      } else {
        failed.push(result.value);
      }
    } else {
      failed.push({
        success: false,
        error: result.reason.message,
        code: 'UPLOAD_ERROR',
        index
      });
    }
  });

  return {
    success: successful.length > 0,
    type: 'pet_images',
    total: files.length,
    successful: successful.length,
    failed: failed.length,
    uploads: successful,
    errors: failed,
    summary: {
      totalUploaded: successful.length,
      totalFailed: failed.length,
      successRate: Math.round((successful.length / files.length) * 100)
    }
  };
}

/**
 * GET /api/upload - Get upload configuration and limits
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      authenticated: !!session?.user,
      limits: {
        maxFileSize: IMAGE_CONSTANTS.MAX_FILE_SIZE,
        maxFileSizeMB: IMAGE_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024),
        allowedFormats: IMAGE_CONSTANTS.ALLOWED_FORMATS,
        maxFiles: 10
      },
      folders: IMAGE_CONSTANTS.FOLDERS,
      rateLimit: {
        windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
        limits: RATE_LIMIT_CONFIG.LIMITS,
        dailyLimits: RATE_LIMIT_CONFIG.DAILY_LIMITS
      },
      user: session?.user ? {
        id: session.user.id,
        type: session.user.type,
        remainingUploads: session.user.id ? getRemainingUploads(session.user.id) : null
      } : null
    });

  } catch (error) {
    console.error('Upload config error:', error);
    
    return NextResponse.json(
      { 
        error: 'Erro ao obter configuração de upload',
        code: 'CONFIG_ERROR' 
      },
      { status: 500 }
    );
  }
}

/**
 * Get remaining uploads for a user
 */
function getRemainingUploads(userId) {
  const now = Date.now();
  const today = new Date().toDateString();
  
  // Get current usage
  const recentAttempts = uploadAttempts.get(userId) || [];
  const validAttempts = recentAttempts.filter(time => now - time < RATE_LIMIT_CONFIG.WINDOW_MS);
  
  const dailyKey = `${userId}_${today}`;
  const dailyAttempts = dailyUploadAttempts.get(dailyKey) || { count: 0, types: {} };
  
  return {
    perMinute: {
      pet: Math.max(0, RATE_LIMIT_CONFIG.LIMITS.pet.max - validAttempts.length),
      avatar: Math.max(0, RATE_LIMIT_CONFIG.LIMITS.avatar.max - validAttempts.length),
      general: Math.max(0, RATE_LIMIT_CONFIG.LIMITS.general.max - validAttempts.length)
    },
    daily: {
      pet: Math.max(0, RATE_LIMIT_CONFIG.DAILY_LIMITS.pet - (dailyAttempts.types.pet || 0)),
      avatar: Math.max(0, RATE_LIMIT_CONFIG.DAILY_LIMITS.avatar - (dailyAttempts.types.avatar || 0)),
      general: Math.max(0, RATE_LIMIT_CONFIG.DAILY_LIMITS.general - dailyAttempts.count)
    }
  };
}

/**
 * OPTIONS /api/upload - Handle preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}