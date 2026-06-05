/**
 * @typedef {Object} Trip
 * @property {string} id - Unique identifier
 * @property {string} code - Trip code/reference
 * @property {string} type - Trip type (e.g., 'cultural', 'adventure')
 * @property {string} status - 'upcoming'|'ongoing'|'completed'|'cancelled'
 * @property {string} startDate - ISO Date string
 * @property {string} endDate - ISO Date string
 * @property {string} guideId - Assigned guide ID
 * @property {TourGuide} [guide] - Assigned guide object
 * @property {string[]} touristIds - List of tourist IDs
 * @property {Tourist[]} [tourists] - List of tourist objects
 * @property {number} price - Total price
 * @property {number} cost - Total cost
 * @property {string} description - Trip description
 */
