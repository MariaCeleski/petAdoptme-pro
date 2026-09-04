/**
 * Cloudinary Service
 * Handles image uploads, transformations, and deletions
 */

import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_FORMATS = ['jpg', 'jpeg', 'png', 'webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file before upload
 */
function validateFile(file) {
  if (!file) {
    throw new Error('Arquivo não fornecido');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`Arquivo muito grande. Máximo: ${MAX_FILE_SIZE / 1024 / 1024}MB`);
  }

  const ext = file.originalname.split('.').pop().toLowerCase();
  if (!ALLOWED_FORMATS.includes(ext)) {
    throw new Error(`Formato não permitido. Aceitos: ${ALLOWED_FORMATS.join(', ')}`);
  }

  return true;
}

/**
 * Upload single or multiple images
 */
export async function uploadImages(files, petId) {
  if (!files || !Array.isArray(files) || files.length === 0) {
    throw new Error('Nenhum arquivo fornecido');
  }

  if (!petId) {
    throw new Error('ID do pet é obrigatório');
  }

  const uploadedImages = [];

  try {
    for (const file of files) {
      validateFile(file);

      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(file.path, {
        folder: `petadopt/pets/${petId}`,
        resource_type: 'auto',
        format: 'webp',
        quality: 'auto',
        max_bytes: MAX_FILE_SIZE,
        eager: [
          { width: 200, height: 200, crop: 'crop', quality: 'auto' }, // thumbnail
          { width: 500, height: 500, crop: 'thumb', radius: 'max', quality: 'auto' }, // avatar
          { width: 1200, height: 800, crop: 'fill', quality: 'auto' }, // display
          { width: 600, height: 400, crop: 'fill', quality: 'auto' }, // mobile
        ],
      });

      // Generate transformation URLs
      const transformations = {
        original: result.secure_url,
        thumbnail: cloudinary.url(result.public_id, {
          width: 200,
          height: 200,
          crop: 'crop',
          quality: 'auto',
        }),
        avatar: cloudinary.url(result.public_id, {
          width: 500,
          height: 500,
          crop: 'thumb',
          radius: 'max',
          quality: 'auto',
        }),
        display: cloudinary.url(result.public_id, {
          width: 1200,
          height: 800,
          crop: 'fill',
          quality: 'auto',
        }),
        mobile: cloudinary.url(result.public_id, {
          width: 600,
          height: 400,
          crop: 'fill',
          quality: 'auto',
        }),
      };

      uploadedImages.push({
        url: result.secure_url,
        publicId: result.public_id,
        transformations,
      });

      // Clean up temporary file
      try {
        await fs.unlink(file.path);
      } catch (err) {
        console.warn('Failed to delete temp file:', err.message);
      }
    }

    return uploadedImages;
  } catch (error) {
    // Clean up all temp files on error
    for (const file of files) {
      try {
        await fs.unlink(file.path);
      } catch (err) {
        // Ignore cleanup errors
      }
    }
    throw error;
  }
}

/**
 * Delete image by public ID
 */
export async function deleteImage(publicId) {
  if (!publicId) {
    throw new Error('Public ID é obrigatório');
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      return true;
    } else {
      throw new Error('Falha ao deletar imagem do Cloudinary');
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
}

/**
 * Delete all images in a folder
 */
export async function deleteFolder(petId) {
  if (!petId) {
    throw new Error('ID do pet é obrigatório');
  }

  try {
    const result = await cloudinary.api.delete_resources_by_prefix(`petadopt/pets/${petId}`);
    return result;
  } catch (error) {
    console.error('Cloudinary folder delete error:', error);
    throw error;
  }
}

/**
 * Get image metadata
 */
export async function getImageMetadata(publicId) {
  try {
    const resource = await cloudinary.api.resource(publicId);
    return {
      url: resource.secure_url,
      width: resource.width,
      height: resource.height,
      bytes: resource.bytes,
      format: resource.format,
      created_at: resource.created_at,
    };
  } catch (error) {
    console.error('Cloudinary metadata error:', error);
    throw error;
  }
}

/**
 * Generate signed URL (para downloads autenticados)
 */
export function generateSignedUrl(publicId, expirationHours = 24) {
  const timestamp = Math.floor(Date.now() / 1000) + expirationHours * 3600;
  
  const signature = cloudinary.utils.compute_hex_hash(
    `public_id=${publicId}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`
  );

  return {
    url: cloudinary.url(publicId, {
      sign_url: true,
      type: 'authenticated',
    }),
    signature,
    timestamp,
  };
}

export default {
  uploadImages,
  deleteImage,
  deleteFolder,
  getImageMetadata,
  generateSignedUrl,
};
