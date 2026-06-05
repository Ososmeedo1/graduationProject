import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Transition, Menu as HeadlessMenu } from '@headlessui/react';
import { CheckCircle2, Inbox, Loader2 } from 'lucide-react';

const formatNotificationTime = (timestamp) => {
  if (!timestamp) return 'Just now';
  try {
    return new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(timestamp));
  } catch {
    return 'Just now';
  }
};

const NotificationsDropdown = ({
  notifications,
  loading,
  loadingMore,
  onMarkRead,
  onLoadMore,
  hasMore,
  style,
}) => {
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  return (
    <Transition
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <HeadlessMenu.Items
        className="notifications-panel glass-sheen fixed w-96 max-w-[90vw] bg-surface border border-stroke rounded-2xl shadow-xl overflow-hidden focus:outline-none z-50"
        style={style}
      >
        <div className="px-4 py-3 border-b border-stroke flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ink">Notifications</p>
            <p className="text-xs text-ink-muted">{unreadCount} unread</p>
          </div>
          <CheckCircle2 className="w-5 h-5 text-primary-500" />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 px-4 py-6 text-ink-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading notifications...</span>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-ink-muted">
              <Inbox className="w-8 h-8" />
              <p className="text-sm">No notifications yet</p>
            </div>
          )}

          {!loading && notifications.length > 0 && (
            <ul className="divide-y divide-stroke">
              {notifications.map((notification) => {
                const title = notification.title || 'Notification';
                const message = notification.message || '';
                const timestamp = formatNotificationTime(notification.createdAt);
                const unread = !notification.isRead;
                return (
                  <li key={notification.id || `${title}-${timestamp}`}>
                    <button
                      type="button"
                      onClick={() => onMarkRead(notification.id)}
                      className={`notification-item w-full text-left px-4 py-3 transition-colors ${unread ? 'is-unread' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${unread ? 'text-ink' : 'text-ink-muted'}`}>
                            {title}
                          </p>
                          {message && (
                            <p className="text-xs text-ink-muted mt-1 line-clamp-2">
                              {message}
                            </p>
                          )}
                          <p className="text-[11px] text-ink-muted mt-2">{timestamp}</p>
                        </div>
                        {unread && <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-500" />}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-stroke px-4 py-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={!hasMore || loadingMore}
            className="w-full text-sm font-semibold text-primary-600 disabled:text-ink-muted disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                {hasMore ? 'Load more' : 'All caught up'}
              </>
            )}
          </button>
        </div>
      </HeadlessMenu.Items>
    </Transition>
  );
};

NotificationsDropdown.propTypes = {
  notifications: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    message: PropTypes.string,
    isRead: PropTypes.bool,
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.instanceOf(Date)]),
  })),
  loading: PropTypes.bool,
  loadingMore: PropTypes.bool,
  onMarkRead: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool,
  style: PropTypes.object,
};

NotificationsDropdown.defaultProps = {
  notifications: [],
  loading: false,
  loadingMore: false,
  hasMore: false,
  style: undefined,
};

export default NotificationsDropdown;
