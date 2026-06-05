import { useState, useEffect } from 'react';
import { APP_CONSTANTS } from '../config/constants';

/**
 * Hook to check if screen matches specific breakpoint
 * @returns {Object} - { isWeb, isTablet, isMobile }
 */
export const useResponsive = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const breakpoints = APP_CONSTANTS?.BREAKPOINTS || { SM: 640, LG: 1024 };

  const isMobile = windowWidth < breakpoints.SM;
  const isTablet = windowWidth >= breakpoints.SM && windowWidth < breakpoints.LG;
  const isWeb = windowWidth >= breakpoints.LG;

  return {
    isMobile,
    isTablet,
    isWeb,
    windowWidth,
  };
};
