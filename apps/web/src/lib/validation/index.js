/**
 * Comprehensive validation system for PetAdopt platform
 * 
 * Implements Task 7.1 requirements:
 * - Complete pet schema with all validations (Requirements 2.2, 2.4)
 * - Comprehensive adoption schema with form validation (Requirements 2.4)
 * - Utility functions for sanitization (Requirements 12.1)
 * 
 * This module provides:
 * - Zod schemas for all data types
 * - Sanitization functions for security
 * - Validation utilities and helpers
 * - Form validation helpers
 * - API route validation middleware
 */

// Export all schemas
export {
  // User schemas
  registerSchema,
  loginSchema,
  
  // Pet schemas
  petSchema,
  petStatusUpdateSchema,
  
  // Adoption schemas
  adoptionSchema,
  adoptionStatusUpdateSchema,
  
  // Shelter schemas
  shelterSchema,
  
  // Image schemas
  imageUploadSchema,
  singleImageSchema,
  avatarUploadSchema,
  petImageUploadSchema,
  
  // Search and filter schemas
  filterSchema,
  
  // Authentication schemas
  passwordResetSchema,
  passwordResetConfirmSchema,
  
  // Contact schema
  contactSchema,
  
} from './schemas.js';

// Export sanitization utilities
export {
  escapeHtml,
  sanitizeSqlInput,
  sanitizeTextInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizeUrl,
  sanitizeJsonString,
  removeNullBytes,
  sanitizeFileName,
  sanitizeInput,
  sanitizeArray,
  sanitizeObject,
  sanitizePetData,
  sanitizeAdoptionData,
  sanitizeUserData,
  sanitizeShelterData,
} from './sanitizers.js';

// Export validation utilities
export {
  formatValidationError,
  validateData,
  safeValidate,
  validatePet,
  validateAdoption,
  validateUserRegistration,
  validateUserLogin,
  validateShelter,
  validateImageUpload,
  validateSingleImage,
  validatePetImageUpload,
  validateAvatarUpload,
  validateFilters,
  validateSearch,
  validatePetStatusUpdate,
  validateAdoptionStatusUpdate,
  validatePasswordReset,
  validatePasswordResetConfirm,
  validateContact,
  validateFormData,
  validateSearchParams,
  validateFileFromFormData,
  validateFilesFromFormData,
  hasFieldError,
  getFieldErrors,
  getFirstFieldError,
  hasGeneralErrors,
  getGeneralErrors,
  getFirstGeneralError,
  withValidation,
  schemas,
} from './utils.js';

// Common validation patterns for reuse
export const ValidationPatterns = {
  // Brazilian phone number (with or without country code)
  PHONE: /^\+?55\s?\(?[1-9]{2}\)?\s?[9]?[0-9]{4}-?[0-9]{4}$/,
  
  // Brazilian ZIP code
  ZIP_CODE: /^\d{5}-?\d{3}$/,
  
  // Pet name (letters, spaces, hyphens, dots)
  PET_NAME: /^[a-zA-ZÀ-ÿ\s\-\.]+$/,
  
  // Person name (letters, spaces, hyphens, dots, apostrophes)
  PERSON_NAME: /^[a-zA-ZÀ-ÿ\s\-\.']+$/,
  
  // Strong password
  STRONG_PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/,
  
  // Pet age formats
  PET_AGE: /^(\d+(-\d+)?\s*(ano|anos|mês|meses|dia|dias)?|filhote|jovem|adulto|adulto maduro|idoso|sênior|não sei a idade)$/i,
  
  // URL (HTTP/HTTPS only)
  SAFE_URL: /^https?:\/\/[^\s$.?#].[^\s]*$/i,
  
  // File name (safe characters only)
  SAFE_FILENAME: /^[a-zA-Z0-9\-_.]+$/,
  
  // Brazilian CPF (basic format)
  CPF: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
  
  // Brazilian CNPJ (basic format)
  CNPJ: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
};

// Common validation messages in Portuguese
export const ValidationMessages = {
  REQUIRED: 'Este campo é obrigatório',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PHONE: 'Telefone inválido',
  INVALID_ZIP_CODE: 'CEP inválido',
  PASSWORD_TOO_SHORT: 'Senha deve ter pelo menos 8 caracteres',
  PASSWORD_TOO_WEAK: 'Senha deve conter maiúscula, minúscula, número e símbolo',
  FILE_TOO_LARGE: 'Arquivo muito grande. Máximo 5MB',
  INVALID_FILE_TYPE: 'Tipo de arquivo inválido',
  TEXT_TOO_SHORT: 'Texto muito curto',
  TEXT_TOO_LONG: 'Texto muito longo',
  INVALID_URL: 'URL inválida',
  INVALID_DATE: 'Data inválida',
  INVALID_NUMBER: 'Número inválido',
  INVALID_ENUM: 'Valor não permitido',
  SANITIZATION_ERROR: 'Erro ao limpar dados',
};

// Validation error codes for API responses
export const ValidationErrorCodes = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  REQUIRED_FIELD_MISSING: 'REQUIRED_FIELD_MISSING',
  INVALID_FORMAT: 'INVALID_FORMAT',
  VALUE_TOO_SHORT: 'VALUE_TOO_SHORT',
  VALUE_TOO_LONG: 'VALUE_TOO_LONG',
  INVALID_FILE_SIZE: 'INVALID_FILE_SIZE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  SANITIZATION_FAILED: 'SANITIZATION_FAILED',
  SECURITY_VIOLATION: 'SECURITY_VIOLATION',
};

// Helper function to create consistent API error responses
export function createValidationErrorResponse(validationResult) {
  return {
    success: false,
    error: {
      code: ValidationErrorCodes.VALIDATION_FAILED,
      message: validationResult.errors.message,
      details: validationResult.errors.fieldErrors,
      generalErrors: validationResult.errors.generalErrors,
    },
    data: null,
    timestamp: new Date().toISOString(),
  };
}

// Helper function to create success response
export function createSuccessResponse(data, message = 'Validação bem-sucedida') {
  return {
    success: true,
    error: null,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

// Type guards for runtime type checking
export const TypeGuards = {
  isString: (value) => typeof value === 'string',
  isNumber: (value) => typeof value === 'number' && !isNaN(value),
  isBoolean: (value) => typeof value === 'boolean',
  isArray: (value) => Array.isArray(value),
  isObject: (value) => value !== null && typeof value === 'object' && !Array.isArray(value),
  isFile: (value) => value instanceof File,
  isValidEmail: (email) => ValidationPatterns.PHONE.test(email),
  isValidPhone: (phone) => ValidationPatterns.PHONE.test(phone),
  isValidUrl: (url) => ValidationPatterns.SAFE_URL.test(url),
};

// Default export with all functionality
// Note: Schemas are exported individually above and can be imported as needed