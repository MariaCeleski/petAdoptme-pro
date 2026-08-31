/**
 * Client-side upload utilities
 * Handles file upload from browser to API
 */

// Upload configuration
const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILES: 10,
  CHUNK_SIZE: 1024 * 1024 // 1MB chunks for large files
};

/**
 * Upload images to the server
 */
export async function uploadImages(files, options = {}) {
  const { 
    type = 'pet',
    petId = null,
    maxFiles = UPLOAD_CONFIG.MAX_FILES,
    onProgress = null 
  } = options;

  // Validate files
  const validation = validateFiles(files);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  // Create form data
  const formData = new FormData();
  
  Array.from(files).forEach(file => {
    formData.append('files', file);
  });
  
  formData.append('type', type);
  formData.append('maxFiles', maxFiles.toString());
  
  if (petId) {
    formData.append('petId', petId);
  }

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    return result;
    
  } catch (error) {
    console.error('Upload error:', error);
    throw new Error(error.message || 'Network error during upload');
  }
}

/**
 * Upload single avatar image
 */
export async function uploadAvatar(file, userId) {
  const validation = validateFiles([file]);
  if (!validation.isValid) {
    throw new Error(validation.errors.join(', '));
  }

  const formData = new FormData();
  formData.append('files', file);
  formData.append('type', 'avatar');
  formData.append('maxFiles', '1');
  
  if (userId) {
    formData.append('userId', userId);
  }

  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Avatar upload failed');
    }

    return result;
    
  } catch (error) {
    console.error('Avatar upload error:', error);
    throw new Error(error.message || 'Network error during avatar upload');
  }
}

/**
 * Validate files before upload
 */
function validateFiles(files) {
  const errors = [];
  
  if (!files || files.length === 0) {
    errors.push('Nenhum arquivo selecionado');
    return { isValid: false, errors };
  }

  if (files.length > UPLOAD_CONFIG.MAX_FILES) {
    errors.push(`Máximo ${UPLOAD_CONFIG.MAX_FILES} arquivos permitidos`);
  }

  Array.from(files).forEach((file, index) => {
    const fileErrors = validateSingleFile(file, index);
    errors.push(...fileErrors);
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate a single file
 */
function validateSingleFile(file, index = 0) {
  const errors = [];
  const filePrefix = `Arquivo ${index + 1}:`;

  // Check file size
  if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE) {
    const sizeMB = (UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024)).toFixed(1);
    errors.push(`${filePrefix} Tamanho máximo ${sizeMB}MB`);
  }

  // Check file type
  if (!UPLOAD_CONFIG.ALLOWED_TYPES.includes(file.type)) {
    errors.push(`${filePrefix} Formato não suportado. Use JPEG, PNG ou WebP`);
  }

  // Check if it's actually a file
  if (!file.name || file.name.trim() === '') {
    errors.push(`${filePrefix} Nome inválido`);
  }

  // Basic security check - file name
  if (file.name && /[<>:"/\\|?*]/.test(file.name)) {
    errors.push(`${filePrefix} Nome contém caracteres inválidos`);
  }

  return errors;
}

/**
 * Get upload progress from XMLHttpRequest
 */
export function uploadWithProgress(files, options = {}) {
  return new Promise((resolve, reject) => {
    const { onProgress } = options;
    const xhr = new XMLHttpRequest();
    
    // Handle progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(Math.round(percentComplete));
        }
      });
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve(result);
        } catch (error) {
          reject(new Error('Invalid response format'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || 'Upload failed'));
        } catch {
          reject(new Error('Upload failed'));
        }
      }
    });

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was cancelled'));
    });

    // Prepare and send request
    const formData = new FormData();
    const { type = 'pet', petId, maxFiles = UPLOAD_CONFIG.MAX_FILES } = options;
    
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });
    
    formData.append('type', type);
    formData.append('maxFiles', maxFiles.toString());
    
    if (petId) {
      formData.append('petId', petId);
    }

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  });
}

/**
 * Get upload configuration from server
 */
export async function getUploadConfig() {
  try {
    const response = await fetch('/api/upload');
    
    if (!response.ok) {
      throw new Error('Failed to fetch upload config');
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Failed to get upload config:', error);
    
    // Return default config as fallback
    return {
      authenticated: false,
      limits: {
        maxFileSize: UPLOAD_CONFIG.MAX_FILE_SIZE,
        maxFileSizeMB: UPLOAD_CONFIG.MAX_FILE_SIZE / (1024 * 1024),
        allowedFormats: UPLOAD_CONFIG.ALLOWED_TYPES,
        maxFiles: UPLOAD_CONFIG.MAX_FILES
      }
    };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Create a preview URL for a file
 */
export function createPreviewUrl(file) {
  if (!file || !file.type.startsWith('image/')) {
    return null;
  }
  
  return URL.createObjectURL(file);
}

/**
 * Revoke preview URL to prevent memory leaks
 */
export function revokePreviewUrl(url) {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

/**
 * Compress image before upload (optional)
 */
export function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.9) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          const compressedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: file.lastModified
          });
          resolve(compressedFile);
        },
        file.type,
        quality
      );
    };
    
    img.src = createPreviewUrl(file);
  });
}

/**
 * Batch upload with retry mechanism
 */
export async function batchUpload(files, options = {}) {
  const { 
    batchSize = 3,
    maxRetries = 3,
    retryDelay = 1000,
    onBatchProgress,
    ...uploadOptions
  } = options;

  const results = {
    successful: [],
    failed: [],
    total: files.length
  };

  // Process files in batches
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (file, index) => {
      const fileIndex = i + index;
      let attempts = 0;
      
      while (attempts < maxRetries) {
        try {
          const result = await uploadImages([file], {
            ...uploadOptions,
            onProgress: (progress) => {
              onBatchProgress?.({
                fileIndex,
                fileName: file.name,
                progress,
                attempt: attempts + 1
              });
            }
          });
          
          results.successful.push({
            fileIndex,
            fileName: file.name,
            result
          });
          
          return result;
          
        } catch (error) {
          attempts++;
          
          if (attempts >= maxRetries) {
            results.failed.push({
              fileIndex,
              fileName: file.name,
              error: error.message,
              attempts
            });
            
            throw error;
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
        }
      }
    });

    // Wait for batch to complete
    await Promise.allSettled(batchPromises);
  }

  return results;
}

export { UPLOAD_CONFIG };