export const APP_CONSTANTS = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
  AUTH_API_BASE_URL: import.meta.env.VITE_AUTH_API_URL || import.meta.env.VITE_API_BASE_URL || '',
  APP_TITLE: import.meta.env.VITE_APP_NAME || import.meta.env.VITE_APP_TITLE || 'رفيق',
  API_MODE: import.meta.env.VITE_API_MODE || 'static',
  AUTH_MODE: import.meta.env.VITE_AUTH_MODE || 'static',

  COLORS: {
    PRIMARY: '#0B3D91',
    PRIMARY_LIGHT: '#EFEFF6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    DANGER: '#EF4444',
  },

  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },

  BREAKPOINTS: {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
}
