import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Constants for image processing
export const IMAGE_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  FOLDERS: {
    PETS: 'petadopt/pets',
    AVATARS: 'petadopt/avatars',
    SHELTERS: 'petadopt/shelters'
  },
  TRANSFORMATIONS: {
    PET_MAIN: {
      width: 800,
      height: 600,
      crop: 'limit',
      quality: 'auto',
      format: 'auto'
    },
    PET_THUMBNAIL: {
      width: 300,
      height: 225,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      format: 'auto'
    },
    PET_CARD: {
      width: 400,
      height: 300,
      crop: 'fill',
      gravity: 'auto',
      quality: 'auto',
      format: 'auto'
    },
    AVATAR: {
      width: 150,
      height: 150,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'auto',
      radius: 'max'
    },
    AVATAR_SMALL: {
      width: 50,
      height: 50,
      crop: 'fill',
      gravity: 'face',
      quality: 'auto',
      format: 'auto',
      radius: 'max'
    }
  }
};

/**
 * Validates file before upload
 * @param {File|Buffer} file - File to validate
 * @param {Object} fileInfo - File info (name, size, type)
 * @returns {Object} Validation result
 */
export function validateFile(file, fileInfo = {}) {
  const errors = [];
  
  // Extract file info
  const size = fileInfo.size || file.size || 0;
  const type = fileInfo.type || file.type || '';
  const name = fileInfo.name || file.name || '';

  // Validate file size
  if (size > IMAGE_CONSTANTS.MAX_FILE_SIZE) {
    errors.push(`Arquivo muito grande. Tamanho máximo: ${IMAGE_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024)}MB`);
  }

  // Validate file format
  if (!IMAGE_CONSTANTS.ALLOWED_FORMATS.includes(type)) {
    errors.push('Formato inválido. Use JPEG, PNG ou WebP');
  }

  // Validate file name
  if (!name) {
    errors.push('Nome do arquivo é obrigatório');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Upload image to Cloudinary with automatic optimization
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result
 */
export async function uploadToCloudinary(buffer, options = {}) {
  const {
    folder = IMAGE_CONSTANTS.FOLDERS.PETS,
    transformation = IMAGE_CONSTANTS.TRANSFORMATIONS.PET_MAIN,
    generateThumbnail = true,
    resourceType = 'image',
    ...otherOptions
  } = options;

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        transformation,
        resource_type: resourceType,
        fetch_format: 'auto',
        quality: 'auto',
        ...otherOptions
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(new Error(`Upload falhou: ${error.message}`));
        } else {
          try {
            // Generate additional versions if requested
            const versions = { main: result };
            
            if (generateThumbnail && folder === IMAGE_CONSTANTS.FOLDERS.PETS) {
              // Generate thumbnail
              const thumbnail = await cloudinary.uploader.explicit(result.public_id, {
                type: 'upload',
                transformation: IMAGE_CONSTANTS.TRANSFORMATIONS.PET_THUMBNAIL,
                format: 'auto'
              });
              
              // Generate card version
              const card = await cloudinary.uploader.explicit(result.public_id, {
                type: 'upload', 
                transformation: IMAGE_CONSTANTS.TRANSFORMATIONS.PET_CARD,
                format: 'auto'
              });
              
              versions.thumbnail = thumbnail;
              versions.card = card;
            }
            
            resolve({
              ...result,
              versions,
              optimized_url: getOptimizedImageUrl(result.public_id),
              thumbnail_url: generateThumbnail ? getOptimizedImageUrl(result.public_id, IMAGE_CONSTANTS.TRANSFORMATIONS.PET_THUMBNAIL) : null,
              card_url: generateThumbnail ? getOptimizedImageUrl(result.public_id, IMAGE_CONSTANTS.TRANSFORMATIONS.PET_CARD) : null
            });
          } catch (versionError) {
            console.error('Error generating versions:', versionError);
            // Still return main upload result if version generation fails
            resolve({
              ...result,
              versions: { main: result },
              optimized_url: getOptimizedImageUrl(result.public_id),
              thumbnail_url: null,
              card_url: null
            });
          }
        }
      }
    ).end(buffer);
  });
}

/**
 * Upload pet image with automatic thumbnail generation
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with thumbnails
 */
export async function uploadPetImage(buffer, options = {}) {
  return uploadToCloudinary(buffer, {
    folder: IMAGE_CONSTANTS.FOLDERS.PETS,
    transformation: IMAGE_CONSTANTS.TRANSFORMATIONS.PET_MAIN,
    generateThumbnail: true,
    ...options
  });
}

/**
 * Upload avatar image with circular crop
 * @param {Buffer} buffer - Image buffer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Upload result with avatar versions
 */
export async function uploadAvatar(buffer, options = {}) {
  const result = await uploadToCloudinary(buffer, {
    folder: IMAGE_CONSTANTS.FOLDERS.AVATARS,
    transformation: IMAGE_CONSTANTS.TRANSFORMATIONS.AVATAR,
    generateThumbnail: false,
    ...options
  });

  // Generate small avatar version
  try {
    const smallAvatar = await cloudinary.uploader.explicit(result.public_id, {
      type: 'upload',
      transformation: IMAGE_CONSTANTS.TRANSFORMATIONS.AVATAR_SMALL,
      format: 'auto'
    });

    return {
      ...result,
      versions: {
        main: result,
        small: smallAvatar
      },
      avatar_url: getOptimizedImageUrl(result.public_id, IMAGE_CONSTANTS.TRANSFORMATIONS.AVATAR),
      avatar_small_url: getOptimizedImageUrl(result.public_id, IMAGE_CONSTANTS.TRANSFORMATIONS.AVATAR_SMALL)
    };
  } catch (error) {
    console.error('Error generating small avatar:', error);
    return {
      ...result,
      versions: { main: result },
      avatar_url: getOptimizedImageUrl(result.public_id, IMAGE_CONSTANTS.TRANSFORMATIONS.AVATAR),
      avatar_small_url: null
    };
  }
}

/**
 * Upload multiple images with batch processing
 * @param {Array<Buffer>} buffers - Array of image buffers
 * @param {Array<Object>} fileInfos - Array of file information
 * @param {Object} options - Upload options
 * @returns {Promise<Array>} Array of upload results
 */
export async function uploadMultipleImages(buffers, fileInfos = [], options = {}) {
  const uploadPromises = buffers.map(async (buffer, index) => {
    const fileInfo = fileInfos[index] || {};
    
    // Validate file
    const validation = validateFile(buffer, fileInfo);
    if (!validation.isValid) {
      throw new Error(`Arquivo ${index + 1}: ${validation.errors.join(', ')}`);
    }

    try {
      return await uploadPetImage(buffer, {
        ...options,
        // Add index to avoid naming conflicts
        public_id_prefix: `${Date.now()}_${index}_`
      });
    } catch (error) {
      throw new Error(`Falha no upload do arquivo ${index + 1}: ${error.message}`);
    }
  });

  return Promise.all(uploadPromises);
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @param {string} resourceType - Resource type (default: 'image')
 * @returns {Promise<Object>} Deletion result
 */
export async function deleteFromCloudinary(publicId, resourceType = 'image') {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    if (result.result === 'ok') {
      return { success: true, publicId, result };
    } else {
      throw new Error(`Falha na exclusão: ${result.result}`);
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw new Error(`Erro ao deletar imagem: ${error.message}`);
  }
}

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} publicIds - Array of public IDs to delete
 * @param {string} resourceType - Resource type (default: 'image')
 * @returns {Promise<Array>} Array of deletion results
 */
export async function deleteMultipleImages(publicIds, resourceType = 'image') {
  try {
    // Use bulk deletion for better performance
    const result = await cloudinary.api.delete_resources(publicIds, {
      resource_type: resourceType
    });
    
    return Object.entries(result.deleted).map(([publicId, status]) => ({
      publicId,
      success: status === 'deleted',
      status
    }));
  } catch (error) {
    console.error('Error bulk deleting from Cloudinary:', error);
    throw new Error(`Erro ao deletar imagens: ${error.message}`);
  }
}

/**
 * Generate optimized image URL
 * @param {string} publicId - Public ID of the image
 * @param {Object} options - Transformation options
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(publicId, options = {}) {
  if (!publicId) return null;
  
  return cloudinary.url(publicId, {
    fetch_format: 'auto',
    quality: 'auto',
    secure: true,
    ...options
  });
}

/**
 * Get pet image URLs with different sizes
 * @param {string} publicId - Public ID of the pet image
 * @returns {Object} Object containing different sized URLs
 */
export function getPetImageUrls(publicId) {
  if (!publicId) return null;
  
  return {
    main: getOptimizedImageUrl(publicId, IMAGE_CONSTANTS.TRANSFORMATIONS.PET_MAIN),
    thumbnail: getOptimizedImageUrl(publicId, IMAGE_CONSTANTS.TRANSFORMATIONS.PET_THUMBNAIL),
    card: getOptimizedImageUrl(publicId, IMAGE_CONSTANTS.TRANSFORMATIONS.PET_CARD),
    original: getOptimizedImageUrl(publicId)
  };
}

/**
 * Get avatar URLs with different sizes
 * @param {string} publicId - Public ID of the avatar image
 * @returns {Object} Object containing different sized avatar URLs
 */
export function getAvatarUrls(publicId) {
  if (!publicId) return null;
  
  return {
    main: getOptimizedImageUrl(publicId, IMAGE_CONSTANTS.TRANSFORMATIONS.AVATAR),
    small: getOptimizedImageUrl(publicId, IMAGE_CONSTANTS.TRANSFORMATIONS.AVATAR_SMALL),
    original: getOptimizedImageUrl(publicId)
  };
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID
 */
export function extractPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Handle different Cloudinary URL formats
    const regex = /\/(?:v\d+\/)?([^/]+\/[^/.]+)(?:\.[^/]+)?(?:\?|$)/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

/**
 * Generate signed upload parameters for client-side uploads
 * @param {Object} options - Upload options
 * @returns {Object} Signed upload parameters
 */
export function generateSignedUploadParams(options = {}) {
  const timestamp = Math.round(Date.now() / 1000);
  
  const params = {
    timestamp,
    folder: options.folder || IMAGE_CONSTANTS.FOLDERS.PETS,
    transformation: options.transformation || IMAGE_CONSTANTS.TRANSFORMATIONS.PET_MAIN,
    ...options
  };
  
  // Generate signature
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  
  return {
    ...params,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
  };
}

/**
 * Health check for Cloudinary configuration
 * @returns {Promise<Object>} Health check result
 */
export async function healthCheck() {
  try {
    // Test basic configuration
    const config = cloudinary.config();
    if (!config.cloud_name || !config.api_key || !config.api_secret) {
      return {
        healthy: false,
        error: 'Configuração incompleta do Cloudinary'
      };
    }

    // Test API connectivity
    await cloudinary.api.ping();
    
    return {
      healthy: true,
      config: {
        cloud_name: config.cloud_name,
        api_key: config.api_key ? `${config.api_key.slice(0, 4)}...` : null
      }
    };
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
}