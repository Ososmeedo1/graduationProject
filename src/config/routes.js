import { ROLES } from './permissions'

export const ROUTES = {
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',

  DASHBOARD: '/',

  USERS: '/users',
  USER_CREATE: '/users/new',

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_AUDIT: '/admin/audit',
  ADMIN_REPORTS: '/admin/reports',
  ADMIN_PRICING: '/admin/pricing',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_BOOKING_DETAILS: '/admin/bookings/:id',
  ADMIN_LIVE_TRACKING: '/admin/bookings/live',
  ADMIN_REVENUE: '/admin/bookings/revenue',
  ADMIN_INVOICES: '/admin/invoices',
  ADMIN_INVOICE_DETAILS: '/admin/invoices/:id',
  ADMIN_SOS: '/admin/sos',
  ADMIN_SOS_DETAILS: '/admin/sos/:id',
  ADMIN_SOS_LIVE: '/admin/sos/live',
}

// Route configuration with roles will be handled in the router component
