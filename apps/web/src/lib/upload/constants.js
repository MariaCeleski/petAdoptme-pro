/**
 * Upload constants that can be safely used in client-side code
 */

export const IMAGE_CONSTANTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 10,
  ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'webp']
};

export const UPLOAD_ENDPOINTS = {
  PETS: '/api/upload',
  AVATARS: '/api/upload',
  SHELTERS: '/api/upload'
};

export const UPLOAD_TYPES = {
  PET: 'pet',
  AVATAR: 'avatar',
  SHELTER: 'shelter'
};