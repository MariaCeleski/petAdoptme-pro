import bcrypt from 'bcryptjs';

/**
 * Hash uma senha usando bcrypt
 * @param {string} password - Senha em texto plano
 * @returns {Promise<string>} - Senha hasheada
 */
export async function hashPassword(password) {
  const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12');
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verifica se uma senha corresponde ao hash
 * @param {string} password - Senha em texto plano
 * @param {string} hashedPassword - Senha hasheada
 * @returns {Promise<boolean>} - True se as senhas correspondem
 */
export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Valida a força da senha
 * @param {string} password - Senha para validar
 * @returns {Object} - Objeto com resultado da validação
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
 * Valida formato de email
 * @param {string} email - Email para validar
 * @returns {Object} - Objeto com resultado da validação
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
 * Gera um token seguro para verificação de email
 * @returns {string} - Token aleatório
 */
export function generateVerificationToken() {
  return crypto.randomUUID();
}

/**
 * Verifica se uma string é um CUID válido
 * @param {string} id - ID para verificar
 * @returns {boolean} - True se é um CUID válido
 */
export function isValidCUID(id) {
  const cuidRegex = /^c[a-z0-9]{24}$/;
  return cuidRegex.test(id);
}