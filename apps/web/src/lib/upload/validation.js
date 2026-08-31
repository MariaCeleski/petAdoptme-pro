/**
 * Image upload validation utilities
 */

import { IMAGE_CONSTANTS } from './constants.js';

/**
 * Validate image file client-side before upload
 * @param {File} file - File object from input
 * @returns {Object} Validation result
 */
export function validateImageFile(file) {
  const errors = [];
  
  // Check if file exists
  if (!file) {
    errors.push('Arquivo é obrigatório');
    return { isValid: false, errors };
  }

  // Check file size
  if (file.size > IMAGE_CONSTANTS.MAX_FILE_SIZE) {
    const maxSizeMB = IMAGE_CONSTANTS.MAX_FILE_SIZE / (1024 * 1024);
    errors.push(`Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`);
  }

  // Check file type
  if (!IMAGE_CONSTANTS.ALLOWED_FORMATS.includes(file.type)) {
    errors.push('Formato inválido. Use JPEG, PNG ou WebP');
  }

  // Check file name
  if (!file.name || file.name.trim() === '') {
    errors.push('Nome do arquivo é obrigatório');
  }

  // Check for potentially dangerous file names
  if (file.name.includes('../') || file.name.includes('..\\')) {
    errors.push('Nome de arquivo inválido');
  }

  return {
    isValid: errors.length === 0,
    errors,
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    }
  };
}

/**
 * Validate multiple image files
 * @param {FileList|Array<File>} files - Files to validate
 * @param {number} maxFiles - Maximum number of files allowed
 * @returns {Object} Validation result
 */
export function validateMultipleImageFiles(files, maxFiles = 10) {
  const errors = [];
  const fileArray = Array.from(files);
  
  // Check number of files
  if (fileArray.length === 0) {
    errors.push('Pelo menos uma imagem é obrigatória');
    return { isValid: false, errors };
  }

  if (fileArray.length > maxFiles) {
    errors.push(`Máximo ${maxFiles} imagens por vez`);
  }

  // Validate each file
  const fileValidations = fileArray.map((file, index) => {
    const validation = validateImageFile(file);
    
    if (!validation.isValid) {
      validation.errors.forEach(error => {
        errors.push(`Arquivo ${index + 1}: ${error}`);
      });
    }
    
    return validation;
  });

  // Check total size
  const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = IMAGE_CONSTANTS.MAX_FILE_SIZE * maxFiles;
  
  if (totalSize > maxTotalSize) {
    const maxTotalSizeMB = maxTotalSize / (1024 * 1024);
    errors.push(`Tamanho total muito grande. Máximo: ${maxTotalSizeMB}MB`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    files: fileValidations.map(v => v.file).filter(Boolean),
    totalSize,
    totalFiles: fileArray.length
  };
}

/**
 * Convert file to buffer for server-side processing
 * @param {File} file - File object
 * @returns {Promise<Buffer>} File buffer
 */
export async function fileToBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      resolve(Buffer.from(reader.result));
    };
    
    reader.onerror = () => {
      reject(new Error('Erro ao ler arquivo'));
    };
    
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} File extension (lowercase)
 */
export function getFileExtension(filename) {
  if (!filename || typeof filename !== 'string') return '';
  
  const lastDot = filename.lastIndexOf('.');
  return lastDot >= 0 ? filename.slice(lastDot + 1).toLowerCase() : '';
}

/**
 * Generate unique filename to prevent conflicts
 * @param {string} originalName - Original filename
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique filename
 */
export function generateUniqueFilename(originalName, prefix = '') {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${prefix}${timestamp}_${random}_${baseName}${extension ? '.' + extension : ''}`;
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Check if file is an image by examining its magic number
 * @param {Buffer} buffer - File buffer
 * @returns {boolean} True if file appears to be an image
 */
export function isValidImageBuffer(buffer) {
  if (!buffer || buffer.length < 4) return false;
  
  // Check magic numbers for common image formats
  const header = buffer.subarray(0, 4);
  
  // JPEG
  if (header[0] === 0xFF && header[1] === 0xD8) return true;
  
  // PNG
  if (header[0] === 0x89 && header[1] === 0x50 && header[2] === 0x4E && header[3] === 0x47) return true;
  
  // WebP
  if (buffer.length >= 12) {
    const webpHeader = buffer.subarray(8, 12);
    if (header.toString('ascii', 0, 4) === 'RIFF' && webpHeader.toString('ascii') === 'WEBP') return true;
  }
  
  return false;
}

/**
 * Sanitize filename for safe storage
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  if (!filename || typeof filename !== 'string') return 'unnamed_file';
  
  return filename
    .replace(/[<>:"/\\|?*]/g, '_') // Replace invalid characters
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
    .toLowerCase()
    .substring(0, 100); // Limit length
}

/**
 * Error messages for different validation scenarios
 */
export const VALIDATION_ERRORS = {
  FILE_REQUIRED: 'Arquivo é obrigatório',
  FILE_TOO_LARGE: 'Arquivo muito grande',
  INVALID_FORMAT: 'Formato de arquivo inválido',
  TOO_MANY_FILES: 'Muitos arquivos selecionados',
  TOTAL_SIZE_EXCEEDED: 'Tamanho total dos arquivos excedido',
  INVALID_FILE_NAME: 'Nome de arquivo inválido',
  READ_ERROR: 'Erro ao ler arquivo',
  INVALID_IMAGE_DATA: 'Dados de imagem inválidos'
};