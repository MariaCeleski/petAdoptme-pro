/**
 * User Types - Tipos relacionados a usuários
 */

/**
 * @typedef {'ADOPTER' | 'SHELTER_ADMIN' | 'INDIVIDUAL_OWNER'} UserType
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID (CUID)
 * @property {string} email - User email
 * @property {string} name - User name
 * @property {string} [avatar] - Avatar URL
 * @property {string} [phone] - Phone number
 * @property {string} [location] - User location
 * @property {UserType} type - User type
 * @property {Date} [emailVerified] - Email verification date
 * @property {Date} createdAt - Creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} LoginCredentials
 * @property {string} email - User email
 * @property {string} password - User password
 */

/**
 * @typedef {Object} RegisterData
 * @property {string} email - User email
 * @property {string} password - User password (min 8 chars)
 * @property {string} name - User name
 * @property {UserType} type - User type
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - User ID
 * @property {string} name - User name
 * @property {string} email - User email
 * @property {string} [avatar] - Avatar URL
 * @property {UserType} type - User type
 */

export const UserTypes = {
  ADOPTER: 'ADOPTER',
  SHELTER_ADMIN: 'SHELTER_ADMIN',
  INDIVIDUAL_OWNER: 'INDIVIDUAL_OWNER',
};
