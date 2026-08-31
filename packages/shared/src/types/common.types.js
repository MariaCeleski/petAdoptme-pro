/**
 * Common Types - Tipos genéricos reutilizáveis
 */

/**
 * @typedef {Object} ApiResponse
 * @property {*} data - Response data
 * @property {string} [message] - Success message
 * @property {string} [error] - Error message
 * @property {number} status - HTTP status code
 * @property {string} timestamp - ISO timestamp
 */

/**
 * @typedef {Object} ApiError
 * @property {string} error - Error message
 * @property {string} code - Error code
 * @property {Object} [details] - Additional error details
 * @property {string} timestamp - ISO timestamp
 */

/**
 * @typedef {Object} PaginationMeta
 * @property {number} page - Current page
 * @property {number} limit - Items per page
 * @property {number} total - Total items
 * @property {number} pages - Total pages
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {*[]} data - Array of items
 * @property {PaginationMeta} meta - Pagination metadata
 */

export const CommonTypes = {};
