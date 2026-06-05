import useAuth from './useAuth';
import { ROLE_PERMISSIONS, ROLES } from '../config/permissions';

/**
 * Hook to check user permissions
 * @returns {Object} { can, hasRole, isAdmin, isManager, isFinance, isOperations, isViewer }
 */
export const usePermissions = () => {
  const { user, permissions: livePermissions = [] } = useAuth();

  const userRole = user?.role;
  const normalizedLivePermissions = (livePermissions.length ? livePermissions : user?.permissions || [])
    .map((permission) => String(permission).toLowerCase());

  const hasRole = (role) => {
    return userRole === role;
  };

  const can = (permission) => {
    if (!userRole) return false;

    const normalizedPermission = String(permission).toLowerCase();
    const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
    const roleBasedMatch = rolePermissions.includes(permission) || rolePermissions.includes(normalizedPermission);

    if (normalizedLivePermissions.length > 0) {
      return normalizedLivePermissions.includes(normalizedPermission) || roleBasedMatch;
    }

    if (userRole === ROLES.SUPER_ADMIN) return true;
    if (userRole !== ROLES.ADMIN) return false;

    return roleBasedMatch;
  };

  const canAny = (permissions = []) => permissions.some((permission) => can(permission));

  const canAll = (permissions = []) => permissions.every((permission) => can(permission));

  return {
    can,
    canAny,
    canAll,
    hasRole,
    isSuperAdmin: hasRole(ROLES.SUPER_ADMIN),
    isAdmin: hasRole(ROLES.ADMIN),
    permissions: normalizedLivePermissions,
    role: userRole,
  };
};

export default usePermissions;
