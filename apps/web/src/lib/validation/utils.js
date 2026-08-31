import { ZodError } from 'zod';
import * as schemas from './schemas.js';

/**
 * Validation utilities for form handling and API validation
 * Provides helper functions to validate and sanitize data using Zod schemas
 */

// Format validation errors for user-friendly display
export function formatValidationError(error) {
  if (!(error instanceof ZodError)) {
    return { 
      message: error.message || 'Erro de validação',
      fieldErrors: {},
      generalErrors: [error.message || 'Erro de validação'],
      hasErrors: true
    };
  }

  const fieldErrors = {};
  const generalErrors = [];

  if (error.errors && Array.isArray(error.errors)) {
    error.errors.forEach(err => {
      if (err.path.length === 0 || err.path[0] === '_root') {
        generalErrors.push(err.message);
      } else {
        const field = err.path.join('.');
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(err.message);
      }
    });
  } else {
    generalErrors.push(error.message || 'Erro de validação');
  }

  return {
    fieldErrors,
    generalErrors,
    message: generalErrors[0] || Object.keys(fieldErrors).length > 0 ? 'Dados inválidos' : 'Erro de validação',
    hasErrors: Object.keys(fieldErrors).length > 0 || generalErrors.length > 0
  };
}

// Validate data against a schema and return formatted result
export function validateData(schema, data) {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: formatValidationError(error)
    };
  }
}

// Safe validation that returns data or null
export function safeValidate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return result.data;
  }
  return null;
}

// Validate pet data
export function validatePet(petData) {
  return validateData(schemas.petSchema, petData);
}

// Validate adoption data
export function validateAdoption(adoptionData) {
  return validateData(schemas.adoptionSchema, adoptionData);
}

// Validate user registration data
export function validateUserRegistration(userData) {
  return validateData(schemas.registerSchema, userData);
}

// Validate user login data
export function validateUserLogin(loginData) {
  return validateData(schemas.loginSchema, loginData);
}

// Validate shelter data
export function validateShelter(shelterData) {
  return validateData(schemas.shelterSchema, shelterData);
}

// Validate image upload data
export function validateImageUpload(uploadData) {
  return validateData(schemas.imageUploadSchema, uploadData);
}

// Validate single image
export function validateSingleImage(imageData) {
  return validateData(schemas.singleImageSchema, imageData);
}

// Validate pet image upload
export function validatePetImageUpload(uploadData) {
  return validateData(schemas.petImageUploadSchema, uploadData);
}

// Validate avatar upload
export function validateAvatarUpload(uploadData) {
  return validateData(schemas.avatarUploadSchema, uploadData);
}

// Validate filters for pet search
export function validateFilters(filterData) {
  return validateData(schemas.filterSchema, filterData);
}

// Validate search parameters
export function validateSearch(searchData) {
  return validateData(schemas.filterSchema, searchData);
}

// Validate pet status update
export function validatePetStatusUpdate(statusData) {
  return validateData(schemas.petStatusUpdateSchema, statusData);
}

// Validate adoption status update
export function validateAdoptionStatusUpdate(statusData) {
  return validateData(schemas.adoptionStatusUpdateSchema, statusData);
}

// Validate password reset request
export function validatePasswordReset(resetData) {
  return validateData(schemas.passwordResetSchema, resetData);
}

// Validate password reset confirmation
export function validatePasswordResetConfirm(confirmData) {
  return validateData(schemas.passwordResetConfirmSchema, confirmData);
}

// Validate contact form
export function validateContact(contactData) {
  return validateData(schemas.contactSchema, contactData);
}

// Validate form data for Next.js API routes
export async function validateFormData(request, schema) {
  try {
    const data = await request.json();
    return validateData(schema, data);
  } catch (error) {
    return {
      success: false,
      data: null,
      errors: {
        message: 'Dados JSON inválidos',
        generalErrors: ['Formato de dados inválido'],
        fieldErrors: {},
        hasErrors: true
      }
    };
  }
}

// Validate URL search parameters
export function validateSearchParams(searchParams, schema) {
  const params = {};
  
  // Convert URLSearchParams to plain object
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  
  return validateData(schema, params);
}

// Validate file from FormData
export function validateFileFromFormData(file, maxSize = 5242880) {
  if (!(file instanceof File)) {
    return {
      success: false,
      errors: {
        message: 'Arquivo inválido',
        generalErrors: ['Arquivo não encontrado ou inválido'],
        fieldErrors: {},
        hasErrors: true
      }
    };
  }

  const fileData = {
    name: file.name,
    size: file.size,
    type: file.type
  };

  return validateSingleImage(fileData);
}

// Validate multiple files from FormData
export function validateFilesFromFormData(files, maxFiles = 10) {
  if (!Array.isArray(files)) {
    return {
      success: false,
      errors: {
        message: 'Lista de arquivos inválida',
        generalErrors: ['Lista de arquivos não encontrada ou inválida'],
        fieldErrors: {},
        hasErrors: true
      }
    };
  }

  if (files.length > maxFiles) {
    return {
      success: false,
      errors: {
        message: `Máximo ${maxFiles} arquivos permitidos`,
        generalErrors: [`Máximo ${maxFiles} arquivos permitidos`],
        fieldErrors: {},
        hasErrors: true
      }
    };
  }

  const filesData = {
    files: files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }))
  };

  return validateImageUpload(filesData);
}

// Helper to check if data has specific validation errors
export function hasFieldError(validationResult, fieldPath) {
  if (!validationResult?.errors?.fieldErrors) return false;
  return fieldPath in validationResult.errors.fieldErrors;
}

// Helper to get field error messages
export function getFieldErrors(validationResult, fieldPath) {
  if (!hasFieldError(validationResult, fieldPath)) return [];
  return validationResult.errors.fieldErrors[fieldPath] || [];
}

// Helper to get first field error message
export function getFirstFieldError(validationResult, fieldPath) {
  const errors = getFieldErrors(validationResult, fieldPath);
  return errors.length > 0 ? errors[0] : null;
}

// Helper to check if validation has any general errors
export function hasGeneralErrors(validationResult) {
  return validationResult?.errors?.generalErrors?.length > 0;
}

// Helper to get general error messages
export function getGeneralErrors(validationResult) {
  return validationResult?.errors?.generalErrors || [];
}

// Helper to get first general error message
export function getFirstGeneralError(validationResult) {
  const errors = getGeneralErrors(validationResult);
  return errors.length > 0 ? errors[0] : null;
}

// Middleware for API route validation
export function withValidation(schema) {
  return async (handler) => {
    return async (request, context) => {
      const validation = await validateFormData(request, schema);
      
      if (!validation.success) {
        return Response.json(
          { 
            error: validation.errors.message,
            details: validation.errors
          },
          { status: 400 }
        );
      }

      // Add validated data to request context
      request.validatedData = validation.data;
      
      return handler(request, context);
    };
  };
}

// Export all schemas for convenience
export { schemas };