/**
 * Pet Types - Tipos relacionados a animais de estimação
 */

/**
 * @typedef {'DOG' | 'CAT'} Species
 */

/**
 * @typedef {'SMALL' | 'MEDIUM' | 'LARGE'} Size
 */

/**
 * @typedef {'MALE' | 'FEMALE'} Gender
 */

/**
 * @typedef {'AVAILABLE' | 'PENDING' | 'ADOPTED' | 'UNAVAILABLE'} PetStatus
 */

/**
 * @typedef {Object} Pet
 * @property {string} id - Pet ID (CUID)
 * @property {string} name - Pet name
 * @property {Species} species - Pet species (DOG or CAT)
 * @property {string} breed - Pet breed
 * @property {string} age - Pet age (e.g., "2 years", "6 months")
 * @property {Size} size - Pet size
 * @property {Gender} gender - Pet gender
 * @property {string} color - Pet color/markings
 * @property {string} description - Pet description
 * @property {boolean} isNeutered - Is pet neutered
 * @property {boolean} isVaccinated - Is pet vaccinated
 * @property {string} [healthStatus] - Additional health info
 * @property {string[]} personality - Array of personality traits
 * @property {string[]} images - Array of image URLs
 * @property {PetStatus} status - Current pet status
 * @property {string} [location] - Pet location/city
 * @property {string} ownerId - Owner user ID
 * @property {string} [shelterId] - Shelter ID (if applicable)
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} PetCard
 * @property {string} id - Pet ID
 * @property {string} name - Pet name
 * @property {string} image - Primary image URL
 * @property {Species} species - Species
 * @property {string} breed - Breed
 * @property {string} age - Age
 * @property {Size} size - Size
 * @property {string} location - Location
 * @property {PetStatus} status - Status
 * @property {string} ownerName - Owner name
 */

/**
 * @typedef {Object} PetFilters
 * @property {Species} [species] - Filter by species
 * @property {Size} [size] - Filter by size
 * @property {Gender} [gender] - Filter by gender
 * @property {string} [location] - Filter by location
 * @property {string} [search] - Search text
 */

export const PetTypes = {
  Species: {
    DOG: 'DOG',
    CAT: 'CAT',
  },
  Size: {
    SMALL: 'SMALL',
    MEDIUM: 'MEDIUM',
    LARGE: 'LARGE',
  },
  Gender: {
    MALE: 'MALE',
    FEMALE: 'FEMALE',
  },
  Status: {
    AVAILABLE: 'AVAILABLE',
    PENDING: 'PENDING',
    ADOPTED: 'ADOPTED',
    UNAVAILABLE: 'UNAVAILABLE',
  },
};
