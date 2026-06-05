import { useContext } from 'react';
import { AlertContext } from '../context/AlertContext';

/**
 * Hook to access alert/confirmation actions
 * @returns {Object} { confirm: (options) => Promise<boolean> }
 */
const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export default useAlert;
