import i18n from '../services/i18n';

/**
 * Format date to string based on locale
 * @param {string|Date} date 
 * @param {string} [dateStyle='medium'] - 'short' | 'medium' | 'long' | 'full'
 * @returns {string}
 */
export const formatDate = (date, dateStyle = 'medium') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat(i18n.language, { dateStyle: dateStyle }).format(d);
};

/**
 * Format time to string based on locale
 * @param {string|Date} date 
 * @param {string} [timeStyle='short'] - 'short' | 'medium' | 'long' | 'full'
 * @returns {string}
 */
export const formatTime = (date, timeStyle = 'short') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat(i18n.language, { timeStyle: timeStyle }).format(d);
};

/**
 * Format date and time to string based on locale
 * @param {string|Date} date 
 * @param {string} [dateStyle='medium'] - 'short' | 'medium' | 'long' | 'full'
 * @param {string} [timeStyle='short'] - 'short' | 'medium' | 'long' | 'full'
 * @returns {string}
 */
export const formatDateTime = (date, dateStyle = 'medium', timeStyle = 'short') => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat(i18n.language, { dateStyle: dateStyle, timeStyle: timeStyle }).format(d);
};

/**
 * Format currency
 * @param {number} amount 
 * @param {string} [currency='EGP'] 
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'EGP') => {
  if (amount === undefined || amount === null) return '';

  return new Intl.NumberFormat(i18n.language, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format number
 * @param {number} number 
 * @returns {string}
 */
export const formatNumber = (number) => {
  if (number === undefined || number === null) return '';

  return new Intl.NumberFormat(i18n.language).format(number);
};
