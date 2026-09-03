/**
 * Validates password strength for immediate UX feedback only.
 * 
 * IMPORTANT: This function is for client-side UX feedback only, NOT for security validation.
 * The server WILL re-validate all passwords for security before accepting them.
 * Never rely on this function for security decisions.
 * 
 * This is a pure function with no async operations or external dependencies.
 * It provides immediate feedback without network calls.
 * 
 * @param {string} password - Password to validate
 * @returns {Object} Plain object with validation result
 * @returns {boolean} result.isValid - Whether password meets UX requirements
 * @returns {string[]} result.errors - Array of validation error messages
 * @returns {number} result.strength - Password strength score (0-4)
 */
export function validatePasswordStrength(password) {
  const errors = [];
  
  if (!password) {
    errors.push('Senha é obrigatória');
    return { isValid: false, errors };
  }
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (password.length > 100) {
    errors.push('Senha muito longa (máximo 100 caracteres)');
  }
  
  // Verificar se tem pelo menos uma letra
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra');
  }
  
  // Verificar se tem pelo menos um número
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
}

/**
 * Calcula a força da senha (0-4)
 * @param {string} password - Senha para avaliar
 * @returns {number} - Força da senha
 */
function calculatePasswordStrength(password) {
  let strength = 0;
  
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  return Math.min(strength, 4);
}

/**
 * Validates email format for immediate UX feedback only.
 * 
 * IMPORTANT: This function is for client-side UX feedback only, NOT for security validation.
 * The server WILL re-validate all emails for security before accepting them.
 * Never rely on this function for security decisions.
 * 
 * This is a pure function with no async operations or external dependencies.
 * It provides immediate feedback without network calls.
 * 
 * @param {string} email - Email to validate
 * @returns {Object} Plain object with validation result
 * @returns {boolean} result.isValid - Whether email meets UX format requirements
 * @returns {string[]} result.errors - Array of validation error messages
 */
export function validateEmail(email) {
  const errors = [];
  
  if (!email) {
    errors.push('Email é obrigatório');
    return { isValid: false, errors };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Formato de email inválido');
  }
  
  if (email.length > 254) {
    errors.push('Email muito longo');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Checks if a string is a valid CUID.
 * 
 * Pure function with no async operations or external dependencies.
 * Used for client-side validation of CUID format.
 * 
 * @param {string} id - ID to check
 * @returns {boolean} True if valid CUID format
 */
export function isValidCUID(id) {
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(id);
}