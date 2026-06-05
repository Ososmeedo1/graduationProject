import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../config/permissions';
import ForbiddenPage from '../../pages/errors/ForbiddenPage';
import { ADMIN_ROLES } from '../../constants/roles';

const ProtectedRoute = () => {
  const { isAuthenticated, isInitialized, user } = useAuth();
  const { can } = usePermissions();
  const location = useLocation();

  if (!isInitialized) {
    // Or a proper loading spinner
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!ADMIN_ROLES.includes(user?.role)) {
    return <ForbiddenPage />;
  }

  const pathname = location.pathname || '';
  const isAdminRoute = pathname.startsWith('/admin');

  if (isAdminRoute) {
    const adminRouteRequirements = [
      { prefix: '/admin/audit', permission: PERMISSIONS.ADMIN_AUDIT_VIEW },
      { prefix: '/admin/reports', permission: PERMISSIONS.ADMIN_REPORTS_VIEW },
      { prefix: '/admin/pricing', permission: PERMISSIONS.ADMIN_PRICING_VIEW },
      { prefix: '/admin/interviews', permission: PERMISSIONS.ADMIN_INTERVIEWS_VIEW },
      { prefix: '/admin/helper-management', permission: PERMISSIONS.ADMIN_MANAGEMENT_VIEW },
      { prefix: '/admin/admin-management', permission: PERMISSIONS.ADMIN_MANAGEMENT_VIEW },
      { prefix: '/admin/chats', permission: PERMISSIONS.ADMIN_DASHBOARD_VIEW },
      { prefix: '/admin/profile', permission: PERMISSIONS.ADMIN_DASHBOARD_VIEW },
      { prefix: '/admin/dashboard', permission: PERMISSIONS.ADMIN_DASHBOARD_VIEW },
    ];

    const matchedRule = adminRouteRequirements.find((rule) => pathname.startsWith(rule.prefix));
    if (matchedRule && !can(matchedRule.permission)) {
      return <ForbiddenPage />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
