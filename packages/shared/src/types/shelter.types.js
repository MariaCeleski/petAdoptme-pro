/**
 * Shelter Types - Tipos relacionados a abrigos
 */

/**
 * @typedef {Object} Shelter
 * @property {string} id - Shelter ID (CUID)
 * @property {string} name - Shelter name
 * @property {string} address - Shelter address
 * @property {string} city - City
 * @property {string} state - State
 * @property {string} zipCode - ZIP code
 * @property {string} phone - Phone number
 * @property {string} email - Email address
 * @property {string} [website] - Website URL
 * @property {string} [description] - Shelter description
 * @property {string} [logo] - Logo URL
 * @property {string[]} images - Shelter photos URLs
 * @property {boolean} isVerified - Is verified
 * @property {string} adminId - Admin user ID
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} ShelterProfile
 * @property {string} id - Shelter ID
 * @property {string} name - Shelter name
 * @property {string} city - City
 * @property {string} phone - Phone
 * @property {string} [logo] - Logo URL
 * @property {string} [description] - Description
 * @property {boolean} isVerified - Is verified
 */

/**
 * @typedef {Object} ShelterStats
 * @property {string} shelterId - Shelter ID
 * @property {number} totalPets - Total pets registered
 * @property {number} availablePets - Available for adoption
 * @property {number} adoptedPets - Successfully adopted
 * @property {number} adoptionRate - Adoption percentage
 */

export const ShelterTypes = {};
