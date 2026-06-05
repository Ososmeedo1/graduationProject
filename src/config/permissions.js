import { ROLE_ADMIN, ROLE_SUPER_ADMIN } from '../constants/roles'

export const ROLES = {
  SUPER_ADMIN: ROLE_SUPER_ADMIN,
  ADMIN: ROLE_ADMIN,
}

export const PERMISSIONS = {
  // Dashboard
  VIEW_DASHBOARD: 'view_dashboard',

  // Admin Suite
  ADMIN_DASHBOARD_VIEW: 'admin_dashboard_view',
  ADMIN_AUDIT_VIEW: 'admin_audit_view',
  ADMIN_MANAGEMENT_VIEW: 'admin_management_view',
  ADMIN_REPORTS_VIEW: 'admin_reports_view',
  ADMIN_INTERVIEWS_VIEW: 'admin_interviews_view',
  ADMIN_PRICING_VIEW: 'admin_pricing_view',
  ADMIN_BOOKINGS_VIEW: 'admin_bookings_view',
  ADMIN_INVOICES_VIEW: 'admin_invoices_view',
  ADMIN_SOS_VIEW: 'admin_sos_view',
  ADMIN_MANAGE: 'admin.manage',
  OPERATIONS_REVIEW: 'operations.review',

  // Users
  MANAGE_USERS: 'manage_users', // Keep generic for now

  // Helpers
  MANAGE_HELPERS: 'manage_helpers',
  HELPER_VIEW: 'helper_view',
  HELPER_CREATE: 'helper_create',
  HELPER_EDIT: 'helper_edit',
  HELPER_DELETE: 'helper_delete',

  // Finance
  MANAGE_FINANCE: 'manage_finance',

  // Trips
  MANAGE_TRIPS: 'manage_trips', // Generic sidebar access
  TRIP_VIEW: 'trip_view',
  TRIP_CREATE: 'trip_create',
  TRIP_EDIT: 'trip_edit',
  TRIP_DELETE: 'trip_delete',

  // Guides
  MANAGE_GUIDES: 'manage_guides', // Generic sidebar access
  GUIDE_VIEW: 'guide_view',
  GUIDE_CREATE: 'guide_create',
  GUIDE_EDIT: 'guide_edit',
  GUIDE_DELETE: 'guide_delete',

  // Tourists
  MANAGE_TOURISTS: 'manage_tourists', // Generic sidebar access
  TOURIST_VIEW: 'tourist_view',
  TOURIST_CREATE: 'tourist_create',
  TOURIST_EDIT: 'tourist_edit',
  TOURIST_DELETE: 'tourist_delete',
}

export const ROLE_PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),

  [ROLES.ADMIN]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.ADMIN_DASHBOARD_VIEW,
    PERMISSIONS.ADMIN_AUDIT_VIEW,
    PERMISSIONS.ADMIN_MANAGEMENT_VIEW,
    PERMISSIONS.ADMIN_INTERVIEWS_VIEW,
    PERMISSIONS.ADMIN_REPORTS_VIEW,
    PERMISSIONS.ADMIN_PRICING_VIEW,
    PERMISSIONS.ADMIN_BOOKINGS_VIEW,
    PERMISSIONS.ADMIN_INVOICES_VIEW,
    PERMISSIONS.ADMIN_SOS_VIEW,
    // Admin has limited module access by default.
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_HELPERS,
    PERMISSIONS.HELPER_VIEW,
  ],
}

export const ALLOWED_MODULES = {
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.ADMIN]: ['dashboard', 'adminDashboard', 'adminHelperManagement', 'adminManagement', 'adminAudit', 'adminReports', 'adminInterviews', 'adminChats', 'adminProfile', 'adminPricing', 'adminBookings', 'adminInvoices', 'adminSos', 'helpers'],
}
