import axiosInstance from './api/axios';
import './api/interceptors'; // Activate interceptors
import * as authApi from './api/authApi';
import * as adminAuditApi from './api/adminAuditApi';
import * as adminDashboardApi from './api/adminDashboardApi';
import * as adminManagementApi from './api/adminManagementApi';
import * as adminReportsApi from './api/adminReportsApi';
import * as adminInterviewsApi from './api/adminInterviewsApi';
import * as adminChatApi from './api/adminChatApi';
import * as adminPricingApi from './api/adminPricingApi';
import * as adminBookingsApi from './api/adminBookingsApi';
import * as adminInvoicesApi from './api/adminInvoicesApi';
import * as adminPaymentsApi from './api/adminPaymentsApi';
import * as adminSosApi from './api/adminSosApi';
import * as notificationsService from './notificationsService';

const notImplemented = async (name, fnName) => {
  const detail = `${name}.${fnName} API service is not implemented yet.`;
  const err = new Error(detail);
  err.response = {
    status: 400,
    data: {
      type: 'https://tools.ietf.org/html/rfc7231#section-6.5.1',
      title: 'Bad Request',
      status: 400,
      detail,
      instance: '',
    },
  };
  throw err;
};

const helperApi = {
  getHelpers: adminManagementApi.getHelpers,
  getPendingHelpers: adminManagementApi.getPendingHelpers,
  getHelperById: adminManagementApi.getHelperById,
  createHelper: adminManagementApi.createHelper,
  updateHelper: adminManagementApi.updateHelper,
  deleteHelper: adminManagementApi.deleteHelper,
  markHelperUnderReview: adminManagementApi.markHelperUnderReview,
  approveHelper: adminManagementApi.approveHelper,
  rejectHelper: adminManagementApi.rejectHelper,
  requestHelperChanges: adminManagementApi.requestHelperChanges,
  banHelper: adminManagementApi.banHelper,
  unbanHelper: adminManagementApi.unbanHelper,
  suspendHelper: adminManagementApi.suspendHelper,
  activateHelper: adminManagementApi.activateHelper,
};

const adminApi = {
  getAdmins: adminManagementApi.getUsers,
  getAdminById: adminManagementApi.getUserById,
  createAdmin: adminManagementApi.createUser,
  updateAdmin: adminManagementApi.updateUser,
  updateAdminRole: async (id, payload) => adminManagementApi.updateAdminRole(id, payload?.role),
  activateAdmin: adminManagementApi.activateAdmin,
  deactivateAdmin: adminManagementApi.deactivateAdmin,
  deleteAdmin: adminManagementApi.deleteUser,
  getRoles: adminManagementApi.getRoles,
  getRoleById: adminManagementApi.getRoleById,
  createRole: adminManagementApi.createRole,
  updateRole: adminManagementApi.updateRole,
  deleteRole: adminManagementApi.deleteRole,
};

const notesApi = {
  getHelperNotes: adminManagementApi.getHelperNotes,
  createHelperNote: adminManagementApi.createHelperNote,
};

const reportsApi = {
  getBookingSummaries: adminReportsApi.getBookingSummaries,
  getFinancialSummary: adminReportsApi.getFinancialSummary,
  getHelperAnalytics: adminReportsApi.getHelperAnalytics,
  getReportBundle: adminReportsApi.getAdminReportsData,
  getReports: adminReportsApi.getReportsList,
  getReportById: adminReportsApi.getReportById,
  resolveReport: adminReportsApi.resolveReport,
};

const auditApi = {
  getAuditLogs: adminAuditApi.getAuditLogs,
  getHelperAuditLogs: adminAuditApi.getHelperAuditLogs,
};

const dashboardApiFacade = {
  getStats: adminDashboardApi.getStats,
  getDashboardStats: adminDashboardApi.getStats,
  getRecentHelpers: adminDashboardApi.getRecentHelpers,
  getRecentActions: adminDashboardApi.getRecentActions,
  getAdminDashboardData: adminDashboardApi.getAdminDashboardData,
  getDashboardData: adminDashboardApi.getAdminDashboardData,
};

const authApiFacade = {
  login: authApi.login,
  verifyOtp: authApi.verifyOtp,
  logout: authApi.logout,
  me: authApi.me,
  forgotPassword: authApi.forgotPassword,
  resetPassword: authApi.resetPassword,
  resendOtp: authApi.resendOtp,
  changePassword: authApi.changePassword,
  checkEmail: authApi.checkEmail || authApi.forgotPassword,
  googleLogin: authApi.googleLogin || (async (...args) => notImplemented('auth', 'googleLogin', args)),
};

export const api = axiosInstance;

export const services = {
  auth: authApiFacade,
  dashboard: dashboardApiFacade,
  helpers: helperApi,
  admins: adminApi,
  notes: notesApi,
  reports: reportsApi,
  audit: auditApi,
  chats: adminChatApi,
  interviews: adminInterviewsApi,
  pricing: adminPricingApi,
  bookings: adminBookingsApi,
  invoices: adminInvoicesApi,
  payments: adminPaymentsApi,
  sos: adminSosApi,
  notifications: notificationsService,
};
