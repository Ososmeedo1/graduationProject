import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Bell, User, LogOut, Sunrise, Sun, Sunset, Moon, MoonStar } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import useNotifications from '../../hooks/useNotifications';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import ThemeCustomizer from '../ui/ThemeCustomizer';
import NotificationsModal from '../notifications/NotificationsModal';
import { APP_CONSTANTS } from '../../config/constants';
import { Menu as HeadlessMenu, Transition } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    loadingMore,
    hasMore,
    fetchNotifications,
    loadMore,
    markAsRead,
  } = useNotifications();
  const [cairoTime, setCairoTime] = useState({ label: '', hour: 0 });
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const timeLocale = i18n.language === 'ar' ? 'ar-EG' : 'en-GB';

  const timeFormatter = useMemo(() => new Intl.DateTimeFormat(timeLocale, {
    timeZone: 'Africa/Cairo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }), [timeLocale]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeLabel = timeFormatter.format(now);
      const hourFormatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Africa/Cairo',
        hour: '2-digit',
        hour12: false,
      });
      const hour = Number(hourFormatter.format(now));
      setCairoTime({ label: timeLabel, hour });
    };

    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, [timeFormatter]);

  const timeBadge = useMemo(() => {
    const hour = cairoTime.hour;
    if (hour >= 5 && hour < 8) return { label: t('time.sunrise', 'Sunrise'), icon: Sunrise };
    if (hour >= 8 && hour < 17) return { label: t('time.sun', 'Sun'), icon: Sun };
    if (hour >= 17 && hour < 19) return { label: t('time.sunset', 'Sunset'), icon: Sunset };
    if (hour >= 19 && hour < 23) return { label: t('time.night', 'Night'), icon: Moon };
    return { label: t('time.midnight', 'Midnight'), icon: MoonStar };
  }, [cairoTime.hour, t]);

  const badgeCount = useMemo(() => {
    if (!unreadCount) return null;
    if (unreadCount > 99) return '99+';
    return String(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    if (notificationsOpen) {
      fetchNotifications();
    }
  }, [fetchNotifications, notificationsOpen]);

  const resolveTargetId = (notification = {}) => {
    return (
      notification?.targetId
      || notification?.TargetId
      || notification?.sosId
      || notification?.SosId
      || notification?.helperId
      || notification?.HelperId
      || notification?.interviewId
      || notification?.InterviewId
      || notification?.entityId
      || notification?.referenceId
      || notification?.payload?.targetId
      || notification?.payload?.TargetId
      || notification?.payload?.sosId
      || notification?.payload?.SosId
      || notification?.payload?.helperId
      || notification?.payload?.interviewId
      || notification?.data?.targetId
      || notification?.data?.TargetId
      || notification?.data?.sosId
      || notification?.data?.SosId
      || notification?.data?.helperId
      || notification?.data?.interviewId
      || ''
    );
  };

  const handleNotificationSelect = (notification) => {
    if (!notification) return;

    markAsRead(notification.id);

    const targetType = String(notification?.targetType || notification?.TargetType || '').toLowerCase();

    if (targetType === 'report') {
      const reportId = resolveTargetId(notification);
      if (reportId) {
        navigate(`/admin/reports/${encodeURIComponent(reportId)}`);
      } else {
        navigate('/admin/reports');
      }
      setNotificationsOpen(false);
      return;
    }

    if (targetType === 'sosevent' || targetType === 'sos_event') {
      const sosId = resolveTargetId(notification);
      if (sosId) {
        navigate(`/admin/sos/${encodeURIComponent(sosId)}`);
      } else {
        navigate('/admin/sos');
      }
      setNotificationsOpen(false);
      return;
    }

    if (targetType === 'helper') {
      const helperId = resolveTargetId(notification);
      if (helperId) {
        navigate(`/helpers/${encodeURIComponent(helperId)}`);
      } else {
        navigate('/helpers');
      }
      setNotificationsOpen(false);
      return;
    }

    if (targetType === 'languageinterview') {
      const interviewId = resolveTargetId(notification);
      if (interviewId) {
        navigate(`/admin/interviews/${encodeURIComponent(interviewId)}`);
      } else {
        navigate('/admin/interviews');
      }
      setNotificationsOpen(false);
    }
  };

  return (
    <header className="bg-surface backdrop-blur-md border-b border-stroke shadow-sm h-16 flex items-center justify-between px-4 fixed top-0 left-0 right-0 md:ltr:left-64 md:rtl:right-64 z-40 transition-colors duration-300">
      <div className="flex items-center">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 mr-2 md:hidden text-ink-muted hover:text-primary-600 hover:bg-surface-inset rounded-xl transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6 rtl:ml-2 rtl:mr-0" />
        </button>
        <span className="brand-mark text-xl font-black bg-gradient-to-r from-primary-700 to-primary-500 dark:from-primary-400 dark:to-primary-300 bg-clip-text text-transparent md:hidden tracking-tighter">
          {t('app.title', APP_CONSTANTS.APP_TITLE || 'رفيق')}
        </span>
      </div>

      <div className="flex items-center space-x-1 sm:space-x-4 rtl:space-x-reverse">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-stroke bg-surface-inset text-ink-muted text-xs font-semibold">
          <time className="tabular-nums text-ink">{cairoTime.label}</time>
          <span className="text-ink-muted">{t('time.cairo', 'Cairo')}</span>
          <span className="flex items-center gap-1 text-ink-muted">
            <timeBadge.icon className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-wide">{timeBadge.label}</span>
          </span>
        </div>
        <ThemeCustomizer />
        <LanguageSwitcher />

        <button
          type="button"
          onClick={() => setNotificationsOpen(true)}
          className="p-2 text-ink-muted hover:text-primary-600 hover:bg-surface-inset rounded-full relative transition-all duration-300 hover:scale-105"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 animate-pulse-slow" />
          {badgeCount && (
            <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-surface">
              {badgeCount}
            </span>
          )}
        </button>

        <HeadlessMenu as="div" className="relative">
          <HeadlessMenu.Button className="flex items-center space-x-2 rtl:space-x-reverse p-1 rounded-full hover:bg-surface-muted transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500/50 hover:shadow-sm">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 shadow-inner flex items-center justify-center text-white font-bold ring-2 ring-surface">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <span className="hidden md:block text-sm font-medium text-ink max-w-25 truncate">
              {user?.name || 'User'}
            </span>
          </HeadlessMenu.Button>

          <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <HeadlessMenu.Items className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-48 bg-surface border border-stroke rounded-xl shadow-xl py-1 focus:outline-none">
              <div className="px-4 py-2 border-b border-stroke">
                <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
                <p className="text-xs text-ink-muted truncate">{user?.email}</p>
              </div>
              <HeadlessMenu.Item>
                {({ active }) => (
                  <Link
                    to="/admin/profile"
                    className={`${active ? 'bg-surface-muted' : ''} block px-4 py-2 text-sm text-ink`}
                  >
                    {t('nav.admin_profile', 'Profile')}
                  </Link>
                )}
              </HeadlessMenu.Item>
              <HeadlessMenu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={`${active ? 'bg-red-50 dark:bg-red-900/20' : ''} flex w-full items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 transition-colors`}
                  >
                    <LogOut className="w-4 h-4 mr-2 rtl:ml-2 rtl:mr-0" />
                    Logout
                  </button>
                )}
              </HeadlessMenu.Item>
            </HeadlessMenu.Items>
          </Transition>
        </HeadlessMenu>
      </div>
      <NotificationsModal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        notifications={notifications}
        loading={notificationsLoading}
        loadingMore={loadingMore}
        onMarkRead={markAsRead}
        onSelectNotification={handleNotificationSelect}
        onLoadMore={loadMore}
        hasMore={hasMore}
      />
    </header>
  );
};

export default Header;
