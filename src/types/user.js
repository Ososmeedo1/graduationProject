/**
 * @typedef {Object} User
 * @property {string} id - Unique identifier
 * @property {string} name - Full name
 * @property {string} email - Email address
 * @property {'admin'|'superadmin'} role - User role
 * @property {string} [avatar] - Avatar URL
 * @property {string} [createdAt] - ISO Date string
 * @property {boolean} isActive - Account status
 */

/**
 * @typedef {Object} AuthResponse
 * @property {User} user - User object
 * @property {string} token - JWT token
 */
