import { z } from 'zod';

/**
 * Sanitization utility functions for data cleaning and security
 * Implements requirement 12.1: validate all user inputs against injection attacks
 */

// HTML escaping for XSS prevention
export function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return text.replace(/[&<>"'`=\/]/g, (s) => map[s]);
}

// SQL injection prevention - remove dangerous characters
export function sanitizeSqlInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove or escape SQL injection patterns
  return input
    .replace(/['";\\]/g, '') // Remove quotes and backslashes
    .replace(/--/g, '') // Remove SQL comments
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    .replace(/\b(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|EXEC|UNION|SELECT)\b/gi, '') // Remove dangerous SQL keywords
    .trim();
}

// Sanitize text input - clean whitespace and dangerous patterns
export function sanitizeTextInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
    .substring(0, 1000); // Limit length
}

// Sanitize email input
export function sanitizeEmail(email) {
  if (typeof email !== 'string') return email;
  
  return email
    .trim()
    .toLowerCase()
    .replace(/[^\w@.\-+]/g, '') // Only allow valid email characters
    .substring(0, 254); // RFC 5321 limit
}

// Sanitize phone number - keep only digits and basic formatting
export function sanitizePhone(phone) {
  if (typeof phone !== 'string') return phone;
  
  return phone
    .replace(/[^\d\s\-\(\)\+]/g, '') // Only digits and basic formatting
    .trim()
    .substring(0, 20);
}

// Sanitize URL input
export function sanitizeUrl(url) {
  if (typeof url !== 'string') return url;
  
  const trimmed = url.trim();
  
  // Allow data URLs (base64 images from FileReader)
  if (trimmed.startsWith('data:image/')) {
    // Validate data URL format: data:image/[type];base64,[base64content]
    if (/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(trimmed)) {
      return trimmed;
    }
    return ''; // Invalid data URL
  }
  
  try {
    const parsed = new URL(trimmed);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.toString();
  } catch {
    return '';
  }
}

// Sanitize JSON string input
export function sanitizeJsonString(jsonStr) {
  if (typeof jsonStr !== 'string') return jsonStr;
  
  try {
    // Parse and stringify to ensure valid JSON
    const parsed = JSON.parse(jsonStr);
    return JSON.stringify(parsed);
  } catch {
    return '[]'; // Return empty array for invalid JSON
  }
}

// Remove null bytes and dangerous Unicode characters
export function removeNullBytes(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\uFEFF\uFFFE\uFFFF]/g, '') // Remove BOM and replacement characters
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, ''); // Remove control characters
}

// Validate and sanitize file name
export function sanitizeFileName(fileName) {
  if (typeof fileName !== 'string') return '';
  
  return fileName
    .replace(/[<>:"\/\\|?*\x00-\x1f]/g, '') // Remove illegal characters
    .replace(/^\.+/, '') // Remove leading dots
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .substring(0, 255) // Limit length
    .trim();
}

// Comprehensive input sanitizer that applies multiple sanitization methods
export function sanitizeInput(input, type = 'text') {
  if (input === null || input === undefined) return input;
  
  let sanitized = input;
  
  // Apply null byte removal first
  if (typeof sanitized === 'string') {
    sanitized = removeNullBytes(sanitized);
  }
  
  // Apply type-specific sanitization
  switch (type) {
    case 'email':
      return sanitizeEmail(sanitized);
    case 'phone':
      return sanitizePhone(sanitized);
    case 'url':
      return sanitizeUrl(sanitized);
    case 'html':
      return escapeHtml(sanitized);
    case 'sql':
      return sanitizeSqlInput(sanitized);
    case 'json':
      return sanitizeJsonString(sanitized);
    case 'filename':
      return sanitizeFileName(sanitized);
    case 'text':
    default:
      return sanitizeTextInput(sanitized);
  }
}

// Zod transform for sanitizing string inputs
export const sanitizeTransform = (type = 'text') => 
  z.string().transform(val => sanitizeInput(val, type));

// Pre-built sanitized string schemas
export const sanitizedStringSchemas = {
  text: z.string().transform(val => sanitizeInput(val, 'text')),
  email: z.string().transform(val => sanitizeInput(val, 'email')),
  phone: z.string().transform(val => sanitizeInput(val, 'phone')),
  url: z.string().transform(val => sanitizeInput(val, 'url')),
  html: z.string().transform(val => sanitizeInput(val, 'html')),
  sql: z.string().transform(val => sanitizeInput(val, 'sql')),
  json: z.string().transform(val => sanitizeInput(val, 'json')),
  filename: z.string().transform(val => sanitizeInput(val, 'filename'))
};

// Array sanitization
export function sanitizeArray(arr, itemType = 'text') {
  if (!Array.isArray(arr)) return [];
  
  return arr
    .filter(item => item !== null && item !== undefined)
    .map(item => sanitizeInput(item, itemType))
    .filter(item => item !== '' && item !== null);
}

// Object sanitization
export function sanitizeObject(obj, fieldTypes = {}) {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return obj;
  
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const type = fieldTypes[key] || 'text';
    
    if (Array.isArray(value)) {
      sanitized[key] = sanitizeArray(value, type);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value, fieldTypes[key] || {});
    } else {
      sanitized[key] = sanitizeInput(value, type);
    }
  }
  
  return sanitized;
}

// Pet-specific sanitization
export function sanitizePetData(petData) {
  const fieldTypes = {
    name: 'text',
    breed: 'text',
    age: 'text',
    color: 'text',
    description: 'text',
    healthStatus: 'text',
    location: 'text',
    personality: 'text' // Will be handled as array in the schema
  };
  
  return sanitizeObject(petData, fieldTypes);
}

// Adoption form sanitization
export function sanitizeAdoptionData(adoptionData) {
  const fieldTypes = {
    message: 'text',
    adopterInfo: {
      personalInfo: {
        fullName: 'text',
        phone: 'phone',
        address: 'text',
        city: 'text',
        state: 'text',
        zipCode: 'text'
      },
      experience: {
        veterinarianInfo: 'text'
      },
      motivation: {
        whyAdopt: 'text',
        expectedCommitment: 'text',
        availableTime: 'text'
      }
    }
  };
  
  return sanitizeObject(adoptionData, fieldTypes);
}

// User input sanitization
export function sanitizeUserData(userData) {
  const fieldTypes = {
    name: 'text',
    email: 'email'
  };
  
  return sanitizeObject(userData, fieldTypes);
}

// Shelter input sanitization
export function sanitizeShelterData(shelterData) {
  const fieldTypes = {
    name: 'text',
    address: 'text',
    city: 'text',
    state: 'text',
    zipCode: 'text',
    phone: 'phone',
    email: 'email',
    website: 'url',
    description: 'text'
  };
  
  return sanitizeObject(shelterData, fieldTypes);
}