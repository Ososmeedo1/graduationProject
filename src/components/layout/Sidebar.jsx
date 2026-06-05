import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  UserCheck,
  Shield,
  MessageSquare,
  Mic,
  ScrollText,
  FileBarChart,
  BadgePercent,
  Calendar,
  MapPin,
  TrendingUp,
  Receipt,
  AlertTriangle
} from 'lucide-react';
import usePermissions from '../../hooks/usePermissions';
import useApiHealth from '../../hooks/useApiHealth';
import { APP_CONSTANTS } from '../../config/constants';
import { ALLOWED_MODULES, PERMISSIONS } from '../../config/permissions';
import useSound from '../../hooks/useSound';

const Sidebar = ({ className = '', onNavigate }) => {
  const { t } = useTranslation();
  const { can, role } = usePermissions();
  const { connected } = useApiHealth();
  const { play } = useSound();


  const navItems = [
    {
      to: '/admin/dashboard',
      module: 'adminDashboard',
      label: 'nav.dashboard',
      icon: LayoutDashboard,
      permission: PERMISSIONS.ADMIN_DASHBOARD_VIEW,
    },
    {
      to: '/admin/helper-management',
      module: 'adminHelperManagement',
      label: 'nav.helper_management',
      icon: UserCheck,
      permission: PERMISSIONS.ADMIN_MANAGEMENT_VIEW,
    },
    {
      to: '/admin/admin-management',
      module: 'adminManagement',
      label: 'nav.adminManagement',
      icon: Shield,
      permission: PERMISSIONS.ADMIN_MANAGEMENT_VIEW,
    },
    {
      to: '/admin/chats',
      module: 'adminChats',
      label: 'nav.chat_hub',
      icon: MessageSquare,
      permission: PERMISSIONS.ADMIN_DASHBOARD_VIEW,
    },
    {
      to: '/admin/interviews',
      module: 'adminInterviews',
      label: 'nav.interviews',
      icon: Mic,
      permission: PERMISSIONS.ADMIN_INTERVIEWS_VIEW,
    },
    {
      to: '/admin/audit',
      module: 'adminAudit',
      label: 'nav.audit_logs',
      icon: ScrollText,
      permission: PERMISSIONS.ADMIN_AUDIT_VIEW,
    },
    {
      to: '/admin/reports',
      module: 'adminReports',
      label: 'nav.adminReports',
      icon: FileBarChart,
      permission: PERMISSIONS.ADMIN_REPORTS_VIEW,
    },
    {
      to: '/admin/pricing',
      module: 'adminPricing',
      label: 'nav.pricing',
      icon: BadgePercent,
      permission: PERMISSIONS.ADMIN_PRICING_VIEW,
    },
    {
      to: '/admin/bookings',
      module: 'adminBookings',
      label: 'nav.bookings',
      icon: Calendar,
      permission: PERMISSIONS.ADMIN_BOOKINGS_VIEW,
      subItems: [
        {
          to: '/admin/bookings/live',
          label: 'nav.live_tracking',
          icon: MapPin,
        },
        {
          to: '/admin/bookings/revenue',
          label: 'nav.revenue',
          icon: TrendingUp,
        },
      ],
    },
    {
      to: '/admin/invoices',
      module: 'adminInvoices',
      label: 'nav.invoices',
      icon: Receipt,
      permission: PERMISSIONS.ADMIN_INVOICES_VIEW,
    },
    {
      to: '/admin/sos',
      module: 'adminSos',
      label: 'nav.sos',
      icon: AlertTriangle,
      permission: PERMISSIONS.ADMIN_SOS_VIEW,
    },
  ];

  return (
    <aside className={`bg-[var(--card-bg)] border-r border-[var(--card-border)] w-64 shrink-0 flex flex-col h-full transition-colors duration-300 ${className}`}>
      <div className="h-16 flex items-center px-6 border-b border-[var(--card-border)]">
        <span className="brand-mark text-xl font-bold text-primary-600 dark:text-primary-400 truncate">
          {t('app.title', APP_CONSTANTS.APP_TITLE || 'رفيق')}
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const allowedModules = ALLOWED_MODULES[role] || [];
          const hasModuleAccess = allowedModules.includes('*') || allowedModules.includes(item.module);
          if (!hasModuleAccess) return null;

          if (item.permission && !can(item.permission)) return null;

          return (
            <React.Fragment key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                data-sound="off"
                onClick={(e) => {
                  play('click');
                  if (onNavigate) onNavigate(e);
                }}
                className={({ isActive }) => `
                  flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                    : 'text-ink-muted hover:bg-surface-inset hover:text-ink'}
                `}
              >
                <item.icon className="h-5 w-5 shrink-0 me-3" />
                {t(item.label, item.label.replace('nav.', ''))}
              </NavLink>
              {item.subItems && (
                <div className="ps-6 mt-1 space-y-1">
                  {item.subItems.map((subItem) => (
                    <NavLink
                      key={subItem.to}
                      to={subItem.to}
                      onClick={(e) => {
                        play('click');
                        if (onNavigate) onNavigate(e);
                      }}
                      className={({ isActive }) => `
                        flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300'
                          : 'text-ink-muted hover:bg-surface-inset hover:text-ink'}
                      `}
                    >
                      <subItem.icon className="h-4 w-4 shrink-0 me-3" />
                      {t(subItem.label, subItem.label.replace('nav.', ''))}
                    </NavLink>
                  ))}
                </div>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      <div className="p-4 border-t border-stroke">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <div className={`shrink-0 w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <p className="text-xs text-ink-muted">
            {connected
              ? t('system.apiConnectionOnline', 'API Connection: Online')
              : t('system.apiConnectionOffline', 'API Connection: Offline')}
          </p>
        </div>
      </div>
    </aside>
  );
};

Sidebar.propTypes = {
  className: PropTypes.string,
  onNavigate: PropTypes.func,
};

export default Sidebar;
