/**
 * Authentication Service
 * Handles password hashing, verification, and validation
 */

import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @param {number} saltRounds - Number of salt rounds (default: 10)
 * @returns {Promise<string>} - Hashed password
 * @throws {Error} If password is invalid or hashing fails
 */
export async function hashPassword(password, saltRounds = 10) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error(`Password hashing failed: ${error.message}`);
  }
}

/**
 * Verify a plain password against a hashed password
 * @param {string} plainPassword - Plain text password to verify
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match
 * @throws {Error} If comparison fails
 */
export async function verifyPassword(plainPassword, hashedPassword) {
  if (!plainPassword || typeof plainPassword !== 'string') {
    throw new Error('Plain password must be a non-empty string');
  }
  
  if (!hashedPassword || typeof hashedPassword !== 'string') {
    throw new Error('Hashed password must be a non-empty string');
  }
  
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    throw new Error(`Password verification failed: ${error.message}`);
  }
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, errors: string[], strength: number }
 *   strength: 0-4 scale indicating password strength
 */
export function validatePasswordStrength(password) {
  const errors = [];
  
  if (!password) {
    errors.push('Senha é obrigatória');
    return { isValid: false, errors, strength: 0 };
  }
  
  if (typeof password !== 'string') {
    errors.push('Senha deve ser um texto');
    return { isValid: false, errors, strength: 0 };
  }
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (password.length > 100) {
    errors.push('Senha muito longa (máximo 100 caracteres)');
  }
  
  // Check for at least one letter
  if (!/[a-zA-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra');
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  const strength = calculatePasswordStrength(password);
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

/**
 * Calculate password strength (0-4 scale)
 * @private
 * @param {string} password - Password to evaluate
 * @returns {number} - Strength level (0-4)
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
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
export function validateEmail(email) {
  const errors = [];
  
  if (!email) {
    errors.push('Email é obrigatório');
    return { isValid: false, errors };
  }
  
  if (typeof email !== 'string') {
    errors.push('Email deve ser um texto');
    return { isValid: false, errors };
  }
  
  // RFC 5322 simplified regex for email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push('Formato de email inválido');
  }
  
  if (email.length > 254) {
    errors.push('Email muito longo (máximo 254 caracteres)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export default { hashPassword, verifyPassword, validatePasswordStrength, validateEmail };
