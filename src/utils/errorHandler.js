import { toast } from 'react-hot-toast';
import i18n from '../services/i18n';

/**
 * Handle API or Application errors
 * @param {Error|string} error 
 * @param {Object} [options]
 * @param {boolean} [options.showToast=true]
 */
export const handleError = (error, options = { showToast: true }) => {
  let message = 'An unexpected error occurred';

  if (typeof error === 'string') {
    message = error;
  } else if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }

  // Try to translate if key exists (simple heuristic: no spaces, contains dot)
  if (message.includes('.') && !message.includes(' ')) {
    message = i18n.t(message, { defaultValue: message });
  }

  if (options.showToast) {
    toast.error(message);
  }

  return message;
};
