import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Inbox, Loader2, X } from 'lucide-react';

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

const NotificationsPanel = ({
  isOpen,
  onClose,
  notifications,
  loading,
  loadingMore,
  onMarkRead,
  onLoadMore,
  hasMore,
}) => {
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-black/30"
        aria-label="Close notifications"
        onClick={onClose}
      />
      <aside className="notifications-panel notifications-panel--drawer glass-sheen fixed right-0 top-0 h-full w-[420px] max-w-[90vw] bg-surface border-l border-stroke shadow-xl">
        <div className="px-5 py-4 border-b border-stroke flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-ink">Notifications</p>
            <p className="text-xs text-ink-muted">{unreadCount} unread</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-inset text-ink-muted"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-2 text-xs text-ink-muted flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary-500" />
          Stay on top of reviews and system updates.
        </div>

        <div className="max-h-[calc(100vh-168px)] overflow-y-auto">
          {loading && (
            <div className="flex items-center gap-2 px-5 py-6 text-ink-muted">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Loading notifications...</span>
            </div>
          )}

          {!loading && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-ink-muted">
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
                      className={`notification-item w-full text-left px-5 py-4 transition-colors ${unread ? 'is-unread' : ''}`}
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

        <div className="border-t border-stroke px-5 py-3">
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
      </aside>
    </div>
  );
};

NotificationsPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
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
};

NotificationsPanel.defaultProps = {
  notifications: [],
  loading: false,
  loadingMore: false,
  hasMore: false,
};

export default NotificationsPanel;
