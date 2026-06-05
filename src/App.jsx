import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, matchPath } from 'react-router-dom';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';

// Auth & Context
import { AuthProvider } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';
import { AlertProvider } from './context/AlertContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationsProvider } from './context/NotificationsContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import UserListPage from './pages/users/UserListPage';
import UserFormPage from './pages/users/UserFormPage';
import HelperListPage from './pages/helpers/HelperListPage';
import HelperDetailPage from './pages/helpers/HelperDetailPage';
import HelperFormPage from './pages/helpers/HelperFormPage';
import AdminInterviewReviewPage from './pages/admin/AdminInterviewReviewPage';
import AdminInterviewDetailPage from './pages/admin/AdminInterviewDetailPage';
import AdminReportDetailPage from './pages/admin/AdminReportDetailPage';
import NotFoundPage from './pages/errors/NotFoundPage';
import Skeleton from './components/ui/Skeleton';

import { APP_CONSTANTS } from './config/constants';

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminAuditPage = lazy(() => import('./pages/admin/AdminAuditPage'));
const AdminHelperManagementPage = lazy(() => import('./pages/admin/AdminHelperManagementPage'));
const AdminUserManagementPage = lazy(() => import('./pages/admin/AdminUserManagementPage'));
const AdminReportsPage = lazy(() => import('./pages/admin/AdminReportsPage'));
const AdminChatManagementPage = lazy(() => import('./pages/admin/AdminChatManagementPage'));
const AdminProfilePage = lazy(() => import('./pages/admin/AdminProfilePage'));
const AdminPricingPage = lazy(() => import('./pages/admin/AdminPricingPage'));
const AdminBookingsPage = lazy(() => import('./pages/admin/AdminBookingsPage'));
const AdminBookingDetailPage = lazy(() => import('./pages/admin/AdminBookingDetailPage'));
const AdminLiveTrackingPage = lazy(() => import('./pages/admin/AdminLiveTrackingPage'));
const AdminRevenuePage = lazy(() => import('./pages/admin/AdminRevenuePage'));
const AdminInvoicesPage = lazy(() => import('./pages/admin/AdminInvoicesPage'));
const AdminInvoiceDetailPage = lazy(() => import('./pages/admin/AdminInvoiceDetailPage'));
const AdminSosListPage = lazy(() => import('./pages/admin/AdminSosListPage'));
const AdminSosDetailPage = lazy(() => import('./pages/admin/AdminSosDetailPage'));
const AdminSosLiveBoardPage = lazy(() => import('./pages/admin/AdminSosLiveBoardPage'));

const RoutesFallback = () => (
  <div className="space-y-4 p-6">
    <Skeleton className="h-10 w-56" />
    <Skeleton className="h-32 w-full" />
    <Skeleton className="h-80 w-full" />
  </div>
);

const DEFAULT_DESCRIPTION = 'RAFIQ admin and operations dashboard with role-based access and live API workflows.';

const ROUTE_META = [
  { path: '/login', title: 'Login', description: 'Secure sign in to access the RAFIQ operations dashboard.' },
  { path: '/forgot-password', title: 'Forgot Password', description: 'Request a password reset link to recover your account.' },
  { path: '/reset-password', title: 'Reset Password', description: 'Set a new password to restore account access.' },
  { path: '/404', title: 'Page Not Found', description: 'The requested page could not be found.' },

  { path: '/users', title: 'Users', description: 'Manage user accounts, roles, and access.' },
  { path: '/users/new', title: 'Create User', description: 'Create a new user account and assign permissions.' },
  { path: '/users/:id/edit', title: 'Edit User', description: 'Update user profile, status, and permissions.' },

  { path: '/helpers', title: 'Helpers', description: 'View and manage helpers in the platform.' },
  { path: '/helpers/new', title: 'Create Helper', description: 'Register a new helper and configure profile details.' },
  { path: '/helpers/:id', title: 'Helper Details', description: 'Review helper profile and operational data.' },
  { path: '/helpers/:id/edit', title: 'Edit Helper', description: 'Edit helper profile information and settings.' },

  { path: '/admin/dashboard', title: 'Dashboard', description: 'Track core KPIs, activity, and system health in real time.' },
  { path: '/admin/audit', title: 'Audit Logs', description: 'Inspect administrative and operational audit trails.' },
  { path: '/admin/chats', title: 'Chat Management', description: 'Monitor and manage platform communication channels.' },
  { path: '/admin/profile', title: 'Admin Profile', description: 'Manage administrator profile and account preferences.' },
  { path: '/admin/helper-management', title: 'Helper Management', description: 'Oversee helper onboarding, status, and approvals.' },
  { path: '/admin/admin-management', title: 'Admin Management', description: 'Manage admin users and role assignments.' },
  { path: '/admin/interviews', title: 'Interviews', description: 'Review and process helper interview records.' },
  { path: '/admin/interviews/:id', title: 'Interview Details', description: 'View detailed interview data and evaluations.' },
  { path: '/admin/reports', title: 'Reports', description: 'Browse and manage operational and incident reports.' },
  { path: '/admin/reports/:id', title: 'Report Details', description: 'Inspect full report details and resolution status.' },
  { path: '/admin/pricing', title: 'Pricing', description: 'Configure pricing plans and billing rules.' },
  { path: '/admin/bookings', title: 'Bookings', description: 'Manage booking lifecycle and assignment flow.' },
  { path: '/admin/bookings/live', title: 'Live Booking Tracking', description: 'Monitor active bookings and live status updates.' },
  { path: '/admin/bookings/revenue', title: 'Booking Revenue', description: 'Analyze booking revenue and financial performance.' },
  { path: '/admin/bookings/:id', title: 'Booking Details', description: 'View booking timeline, assignment, and payment details.' },
  { path: '/admin/invoices', title: 'Invoices', description: 'Manage invoices, payment states, and billing history.' },
  { path: '/admin/invoices/:id', title: 'Invoice Details', description: 'Inspect invoice line items, payment, and status actions.' },
  { path: '/admin/sos', title: 'SOS Cases', description: 'Track and manage SOS alerts and emergency events.' },
  { path: '/admin/sos/live', title: 'Live SOS Board', description: 'Monitor SOS incidents in real time.' },
  { path: '/admin/sos/:id', title: 'SOS Details', description: 'Review SOS case timeline, responses, and outcomes.' },
];

const RouteMeta = () => {
  const { pathname } = useLocation();

  const currentMeta = ROUTE_META.find((entry) =>
    Boolean(matchPath({ path: entry.path, end: true }, pathname))
  );

  const title = currentMeta?.title
    ? `${currentMeta.title} | ${APP_CONSTANTS.APP_TITLE}`
    : APP_CONSTANTS.APP_TITLE;

  return (
    <>
      <title>{title}</title>
      <meta
        name="description"
        content={currentMeta?.description || DEFAULT_DESCRIPTION}
      />
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <SoundProvider>
        <AuthProvider>
          <NotificationsProvider>
            <AlertProvider>
              <Router>
                <RouteMeta />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#333',
                      color: '#fff',
                      borderRadius: '16px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
                      fontFamily: '"Plus Jakarta Sans", sans-serif'
                    },
                    success: {
                      style: {
                        background: '#10b981',
                      }
                    },
                    error: {
                      style: {
                        background: '#ef4444',
                      }
                    }
                  }}
                >
                  {(toastItem) => (
                    <ToastBar toast={toastItem}>
                      {({ icon, message }) => (
                        <div className="flex items-center gap-2">
                          {icon}
                          <span>{message}</span>
                          <button
                            type="button"
                            onClick={() => toast.dismiss(toastItem.id)}
                            className="ms-2 inline-flex items-center justify-center rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white"
                            aria-label="Close notification"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </ToastBar>
                  )}
                </Toaster>
                <Suspense fallback={<RoutesFallback />}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/reset-password" element={<ResetPasswordPage />} />

                    <Route path="/404" element={<NotFoundPage />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute />}>
                      <Route element={<MainLayout />}>
                        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

                        {/* User Routes */}
                        <Route path="/users" element={<UserListPage />} />
                        <Route path="/users/new" element={<UserFormPage />} />
                        <Route path="/users/:id/edit" element={<UserFormPage />} />

                        {/* Helper Routes */}
                        <Route path="/helpers" element={<HelperListPage />} />
                        <Route path="/helpers/new" element={<HelperFormPage />} />
                        <Route path="/helpers/:id" element={<HelperDetailPage />} />
                        <Route path="/helpers/:id/edit" element={<HelperFormPage />} />

                        {/* Admin Routes */}
                        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                        <Route path="/admin/audit" element={<AdminAuditPage />} />
                        <Route path="/admin/chats" element={<AdminChatManagementPage />} />
                        <Route path="/admin/profile" element={<AdminProfilePage />} />
                        <Route path="/admin/helper-management" element={<AdminHelperManagementPage />} />
                        <Route path="/admin/admin-management" element={<AdminUserManagementPage />} />
                        <Route path="/admin/interviews" element={<AdminInterviewReviewPage />} />
                        <Route path="/admin/interviews/:id" element={<AdminInterviewDetailPage />} />
                        <Route path="/admin/reports" element={<AdminReportsPage />} />
                        <Route path="/admin/reports/:id" element={<AdminReportDetailPage />} />
                        <Route path="/admin/pricing" element={<AdminPricingPage />} />
                        <Route path="/admin/bookings" element={<AdminBookingsPage />} />
                        <Route path="/admin/bookings/:id" element={<AdminBookingDetailPage />} />
                        <Route path="/admin/bookings/live" element={<AdminLiveTrackingPage />} />
                        <Route path="/admin/bookings/revenue" element={<AdminRevenuePage />} />
                        <Route path="/admin/invoices" element={<AdminInvoicesPage />} />
                        <Route path="/admin/invoices/:id" element={<AdminInvoiceDetailPage />} />
                        <Route path="/admin/sos" element={<AdminSosListPage />} />
                        <Route path="/admin/sos/:id" element={<AdminSosDetailPage />} />
                        <Route path="/admin/sos/live" element={<AdminSosLiveBoardPage />} />
                      </Route>
                    </Route>

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Routes>
                </Suspense>
              </Router>
            </AlertProvider>
          </NotificationsProvider>
        </AuthProvider>
      </SoundProvider>
    </ThemeProvider>
  );
}

export default App;
