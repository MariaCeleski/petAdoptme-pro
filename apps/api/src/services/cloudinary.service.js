/**
 * Cloudinary Service - Handle photo uploads for pets
 * Phase 2: Photo persistence
 */

import cloudinaryLib from 'cloudinary';

const cloudinary = cloudinaryLib.v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('📸 Cloudinary Service Initialized');
console.log('   Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME || '❌ Missing');
console.log('   API Key:', process.env.CLOUDINARY_API_KEY ? '✅ Set' : '❌ Missing');

/**
 * Upload a single pet photo to Cloudinary
 * @param {Buffer} file - File buffer from multer
 * @returns {Promise} Upload result with secure_url and public_id
 */
export async function uploadPetPhoto(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.buffer) {
      return reject(new Error('Invalid file buffer'));
    }

    console.log(`📤 Uploading file: ${file.originalname} (${file.size} bytes)`);

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'petadopt/pets',
        resource_type: 'auto',
        quality: 'auto',
        fetch_format: 'auto',
        max_bytes: 2 * 1024 * 1024, // 2MB
      },
      (error, result) => {
        if (error) {
          console.error(`❌ Cloudinary upload failed: ${error.message}`);
          console.error('   Error details:', error);
          return reject(new Error(`Cloudinary upload error: ${error.message}`));
        }
        console.log(`✅ Upload successful: ${result.public_id}`);
        console.log(`   URL: ${result.secure_url}`);
        resolve(result);
      }
    );

    // Handle stream errors
    stream.on('error', (error) => {
      console.error(`❌ Stream error: ${error.message}`);
      reject(new Error(`Stream error: ${error.message}`));
    });

    stream.end(file.buffer);
  });
}

/**
 * Upload multiple pet photos
 * @param {Array} files - Array of file objects from multer
 * @returns {Promise} Array of upload results
 */
export async function uploadMultiplePhotos(files) {
  if (!files || files.length === 0) {
    console.log('📸 No files to upload');
    return [];
  }

  console.log(`📸 Uploading ${files.length} file(s)...`);
  
  try {
    const uploadPromises = files.map((file, index) => 
      uploadPetPhoto(file).catch(error => {
        console.error(`❌ Failed to upload file ${index + 1}/${files.length}:`, error.message);
        throw error;
      })
    );
    const results = await Promise.all(uploadPromises);
    console.log(`✅ All ${results.length} files uploaded successfully`);
    return results;
  } catch (error) {
    console.error(`❌ Failed to upload photos: ${error.message}`);
    throw new Error(`Failed to upload photos: ${error.message}`);
  }
}

/**
 * Delete a photo from Cloudinary
 * @param {String} publicId - Public ID of the resource to delete
 * @returns {Promise} Delete result
 */
export async function deletePhoto(publicId) {
  try {
    console.log(`🗑️ Deleting photo: ${publicId}`);
    const result = await cloudinary.uploader.destroy(publicId);
    console.log(`✅ Photo deleted: ${publicId}`);
    return result;
  } catch (error) {
    console.error(`❌ Failed to delete photo ${publicId}:`, error.message);
    throw new Error(`Failed to delete photo: ${error.message}`);
  }
}

/**
 * Delete multiple photos
 * @param {Array} publicIds - Array of public IDs
 * @returns {Promise} Array of delete results
 */
export async function deleteMultiplePhotos(publicIds) {
  if (!publicIds || publicIds.length === 0) {
    return [];
  }

  try {
    const deletePromises = publicIds.map(id => deletePhoto(id));
    return await Promise.all(deletePromises);
  } catch (error) {
    console.error(`❌ Failed to delete photos: ${error.message}`);
    throw new Error(`Failed to delete photos: ${error.message}`);
  }
}

/**
 * Format upload results for database storage
 * @param {Array} uploadResults - Array of Cloudinary upload results
 * @returns {Array} Formatted photo objects
 */
export function formatPhotosForDB(uploadResults) {
  return uploadResults.map(result => ({
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    size: result.bytes,
    format: result.format,
  }));
}

export default {
  uploadPetPhoto,
  uploadMultiplePhotos,
  deletePhoto,
  deleteMultiplePhotos,
  formatPhotosForDB,
};
