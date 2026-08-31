/**
 * Upload utility functions for handling file operations
 */

import { 
  uploadPetImage, 
  uploadAvatar, 
  uploadMultipleImages, 
  deleteFromCloudinary, 
  deleteMultipleImages,
  extractPublicId,
  getPetImageUrls,
  getAvatarUrls 
} from '../cloudinary.js';

import { 
  validateImageFile, 
  validateMultipleImageFiles, 
  fileToBuffer,
  isValidImageBuffer,
  VALIDATION_ERRORS 
} from './validation.js';

/**
 * Upload error class for better error handling
 */
export class UploadError extends Error {
  constructor(message, code, details = null) {
    super(message);
    this.name = 'UploadError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Upload progress tracking
 */
export class UploadProgressTracker {
  constructor(totalFiles = 1) {
    this.totalFiles = totalFiles;
    this.completedFiles = 0;
    this.failedFiles = 0;
    this.results = [];
    this.errors = [];
  }

  addResult(result) {
    this.results.push(result);
    this.completedFiles++;
  }

  addError(error, fileIndex) {
    this.errors.push({ error, fileIndex });
    this.failedFiles++;
  }

  getProgress() {
    const processed = this.completedFiles + this.failedFiles;
    return {
      total: this.totalFiles,
      completed: this.completedFiles,
      failed: this.failedFiles,
      processed,
      percentage: Math.round((processed / this.totalFiles) * 100),
      isComplete: processed === this.totalFiles
    };
  }

  getResults() {
    return {
      progress: this.getProgress(),
      results: this.results,
      errors: this.errors,
      hasErrors: this.errors.length > 0
    };
  }
}

/**
 * Process and upload a single pet image
 * @param {File} file - Image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export async function processPetImageUpload(file, options = {}) {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new UploadError(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        validation.errors
      );
    }

    // Convert to buffer
    const buffer = await fileToBuffer(file);
    
    // Validate buffer content
    if (!isValidImageBuffer(buffer)) {
      throw new UploadError(
        VALIDATION_ERRORS.INVALID_IMAGE_DATA,
        'INVALID_IMAGE_DATA'
      );
    }

    // Upload to Cloudinary
    const result = await uploadPetImage(buffer, {
      public_id: options.public_id,
      tags: ['pet', 'upload', ...(options.tags || [])],
      context: {
        uploaded_by: options.userId || 'unknown',
        upload_type: 'pet_image',
        original_name: file.name,
        ...options.context
      }
    });

    return {
      success: true,
      file: validation.file,
      upload: result,
      urls: getPetImageUrls(result.public_id)
    };

  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    
    throw new UploadError(
      `Falha no upload: ${error.message}`,
      'UPLOAD_ERROR',
      error
    );
  }
}

/**
 * Process and upload an avatar image
 * @param {File} file - Avatar image file to upload
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export async function processAvatarUpload(file, options = {}) {
  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      throw new UploadError(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        validation.errors
      );
    }

    // Convert to buffer
    const buffer = await fileToBuffer(file);
    
    // Validate buffer content
    if (!isValidImageBuffer(buffer)) {
      throw new UploadError(
        VALIDATION_ERRORS.INVALID_IMAGE_DATA,
        'INVALID_IMAGE_DATA'
      );
    }

    // Upload avatar to Cloudinary
    const result = await uploadAvatar(buffer, {
      public_id: options.public_id,
      tags: ['avatar', 'profile', ...(options.tags || [])],
      context: {
        uploaded_by: options.userId || 'unknown',
        upload_type: 'avatar',
        original_name: file.name,
        ...options.context
      }
    });

    return {
      success: true,
      file: validation.file,
      upload: result,
      urls: getAvatarUrls(result.public_id)
    };

  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    
    throw new UploadError(
      `Falha no upload do avatar: ${error.message}`,
      'UPLOAD_ERROR',
      error
    );
  }
}

/**
 * Process and upload multiple pet images with progress tracking
 * @param {FileList|Array<File>} files - Image files to upload
 * @param {Object} options - Upload options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Object>} Upload results
 */
export async function processMultiplePetImageUploads(files, options = {}, onProgress = null) {
  const fileArray = Array.from(files);
  const tracker = new UploadProgressTracker(fileArray.length);

  try {
    // Validate all files first
    const validation = validateMultipleImageFiles(fileArray, options.maxFiles);
    if (!validation.isValid) {
      throw new UploadError(
        validation.errors.join(', '),
        'VALIDATION_ERROR',
        validation.errors
      );
    }

    // Process uploads with progress tracking
    const uploadPromises = fileArray.map(async (file, index) => {
      try {
        const result = await processPetImageUpload(file, {
          ...options,
          public_id: options.public_id ? `${options.public_id}_${index}` : undefined,
          tags: ['batch_upload', `batch_${Date.now()}`, ...(options.tags || [])]
        });

        tracker.addResult(result);
        
        if (onProgress) {
          onProgress(tracker.getProgress(), result, index);
        }

        return result;

      } catch (error) {
        tracker.addError(error, index);
        
        if (onProgress) {
          onProgress(tracker.getProgress(), null, index, error);
        }

        // Continue processing other files even if one fails
        return {
          success: false,
          file: { name: file.name, size: file.size, type: file.type },
          error: error.message,
          index
        };
      }
    });

    const results = await Promise.allSettled(uploadPromises);
    const finalResults = tracker.getResults();
    
    return {
      ...finalResults,
      results: results.map((result, index) => 
        result.status === 'fulfilled' 
          ? result.value 
          : { success: false, error: result.reason.message, index }
      )
    };

  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    
    throw new UploadError(
      `Falha no upload múltiplo: ${error.message}`,
      'MULTIPLE_UPLOAD_ERROR',
      error
    );
  }
}

/**
 * Delete image by URL or public ID
 * @param {string} urlOrPublicId - Image URL or public ID
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteImage(urlOrPublicId) {
  try {
    let publicId = urlOrPublicId;
    
    // Extract public ID if URL was provided
    if (urlOrPublicId.includes('cloudinary.com')) {
      publicId = extractPublicId(urlOrPublicId);
      if (!publicId) {
        throw new UploadError(
          'Não foi possível extrair ID público da URL',
          'INVALID_URL'
        );
      }
    }

    const result = await deleteFromCloudinary(publicId);
    
    return {
      success: true,
      publicId,
      result
    };

  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    
    throw new UploadError(
      `Falha na exclusão: ${error.message}`,
      'DELETE_ERROR',
      error
    );
  }
}

/**
 * Delete multiple images by URLs or public IDs
 * @param {Array<string>} urlsOrPublicIds - Array of image URLs or public IDs
 * @returns {Promise<Object>} Deletion results
 */
export async function deleteMultipleImagesByUrl(urlsOrPublicIds) {
  try {
    const publicIds = urlsOrPublicIds.map(urlOrId => {
      if (urlOrId.includes('cloudinary.com')) {
        const publicId = extractPublicId(urlOrId);
        if (!publicId) {
          throw new UploadError(
            `Não foi possível extrair ID público da URL: ${urlOrId}`,
            'INVALID_URL'
          );
        }
        return publicId;
      }
      return urlOrId;
    });

    const results = await deleteMultipleImages(publicIds);
    
    return {
      success: true,
      results,
      totalDeleted: results.filter(r => r.success).length,
      totalFailed: results.filter(r => !r.success).length
    };

  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }
    
    throw new UploadError(
      `Falha na exclusão múltipla: ${error.message}`,
      'MULTIPLE_DELETE_ERROR',
      error
    );
  }
}

/**
 * Cleanup orphaned images (images not referenced in database)
 * @param {Array<string>} allImageUrls - All image URLs from database
 * @param {string} folder - Cloudinary folder to cleanup
 * @returns {Promise<Object>} Cleanup results
 */
export async function cleanupOrphanedImages(allImageUrls, folder = 'petadopt/pets') {
  try {
    // This would require Cloudinary Admin API to list all resources
    // For now, we'll return a placeholder implementation
    console.warn('Cleanup de imagens órfãs não implementado - requer API Admin do Cloudinary');
    
    return {
      success: true,
      message: 'Cleanup de imagens órfãs não implementado',
      cleaned: 0
    };

  } catch (error) {
    throw new UploadError(
      `Falha no cleanup: ${error.message}`,
      'CLEANUP_ERROR',
      error
    );
  }
}

/**
 * Retry failed upload with exponential backoff
 * @param {Function} uploadFn - Upload function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise<any>} Upload result
 */
export async function retryUpload(uploadFn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await uploadFn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new UploadError(
    `Upload falhou após ${maxRetries + 1} tentativas: ${lastError.message}`,
    'MAX_RETRIES_EXCEEDED',
    lastError
  );
}

/**
 * Get upload statistics for monitoring
 * @param {Array<Object>} uploadResults - Array of upload results
 * @returns {Object} Upload statistics
 */
export function getUploadStatistics(uploadResults) {
  const total = uploadResults.length;
  const successful = uploadResults.filter(r => r.success).length;
  const failed = total - successful;
  
  const totalSize = uploadResults
    .filter(r => r.file)
    .reduce((sum, r) => sum + r.file.size, 0);

  const avgSize = total > 0 ? totalSize / total : 0;

  return {
    total,
    successful,
    failed,
    successRate: total > 0 ? (successful / total) * 100 : 0,
    totalSize,
    averageSize: avgSize,
    formattedTotalSize: formatBytes(totalSize),
    formattedAverageSize: formatBytes(avgSize)
  };
}

/**
 * Format bytes to human readable string
 * @param {number} bytes - Bytes to format
 * @returns {string} Formatted string
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Export error codes for use in components
export const UPLOAD_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_IMAGE_DATA: 'INVALID_IMAGE_DATA',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  DELETE_ERROR: 'DELETE_ERROR',
  MULTIPLE_UPLOAD_ERROR: 'MULTIPLE_UPLOAD_ERROR',
  MULTIPLE_DELETE_ERROR: 'MULTIPLE_DELETE_ERROR',
  CLEANUP_ERROR: 'CLEANUP_ERROR',
  MAX_RETRIES_EXCEEDED: 'MAX_RETRIES_EXCEEDED',
  INVALID_URL: 'INVALID_URL'
};