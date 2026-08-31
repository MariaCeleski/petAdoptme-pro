import { clsx } from 'clsx';

// Utility for conditional class names
export function cn(...classes) {
  return clsx(...classes);
}

// Format currency (Brazilian Real)
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

// Format date to Brazilian format
export function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
}

// Format relative time (e.g., "2 dias atrás")
export function formatRelativeTime(date) {
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return rtf.format(-days, 'day');
  if (days < 30) return rtf.format(-Math.floor(days / 7), 'week');
  if (days < 365) return rtf.format(-Math.floor(days / 30), 'month');
  return rtf.format(-Math.floor(days / 365), 'year');
}

// Slugify function for URLs
export function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Generate random string
export function generateRandomString(length = 32) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Validate file size and type
export function validateFile(file, maxSize = 5242880, allowedTypes = ['image/jpeg', 'image/png', 'image/webp']) {
  const errors = [];
  
  if (file.size > maxSize) {
    errors.push('Arquivo muito grande. Tamanho máximo: 5MB');
  }
  
  if (!allowedTypes.includes(file.type)) {
    errors.push('Formato inválido. Use JPEG, PNG ou WebP');
  }
  
  return { isValid: errors.length === 0, errors };
}

// Get pet age category
export function getAgeCategory(age) {
  const ageNum = parseInt(age);
  if (ageNum < 1) return 'Filhote';
  if (ageNum <= 3) return 'Jovem';
  if (ageNum <= 7) return 'Adulto';
  return 'Idoso';
}

// Get pet size in Portuguese
export function getSizeInPortuguese(size) {
  const sizeMap = {
    'SMALL': 'Pequeno',
    'MEDIUM': 'Médio',
    'LARGE': 'Grande'
  };
  return sizeMap[size] || size;
}

// Get species in Portuguese
export function getSpeciesInPortuguese(species) {
  const speciesMap = {
    'DOG': 'Cão',
    'CAT': 'Gato'
  };
  return speciesMap[species] || species;
}

// Get gender in Portuguese
export function getGenderInPortuguese(gender) {
  const genderMap = {
    'MALE': 'Macho',
    'FEMALE': 'Fêmea'
  };
  return genderMap[gender] || gender;
}