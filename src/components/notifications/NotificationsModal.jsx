import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, Inbox, Loader2 } from 'lucide-react';
import Modal from '../ui/Modal';

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

const NotificationsModal = ({
  isOpen,
  onClose,
  notifications,
  loading,
  loadingMore,
  onMarkRead,
  onSelectNotification,
  onLoadMore,
  hasMore,
}) => {
  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.isRead).length,
    [notifications]
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications" size="lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs text-ink-muted">{unreadCount} unread</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-muted">
          <CheckCircle2 className="w-4 h-4 text-primary-500" />
          Stay on top of reviews and system updates.
        </div>
      </div>

      <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-stroke">
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
                    onClick={() => {
                      if (onSelectNotification) {
                        onSelectNotification(notification);
                        return;
                      }
                      onMarkRead(notification.id);
                    }}
                    className={`notification-item w-full text-left px-5 py-4 transition-colors border-l-4 ${unread
                        ? 'is-unread border-l-primary-500 bg-primary-50/70 dark:bg-primary-900/20'
                        : 'border-l-transparent bg-surface hover:bg-surface-muted/70'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className={`text-sm ${unread ? 'font-semibold text-ink' : 'font-medium text-ink-muted'}`}>
                          {title}
                        </p>
                        {message && (
                          <p className={`text-xs mt-1 line-clamp-2 ${unread ? 'text-ink-muted' : 'text-ink-muted/80'}`}>
                            {message}
                          </p>
                        )}
                        <p className={`text-[11px] mt-2 ${unread ? 'text-ink-muted' : 'text-ink-muted/75'}`}>{timestamp}</p>
                      </div>
                      {unread ? (
                        <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary-500" />
                      ) : (
                        <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-ink-muted/70">Read</span>
                      )}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="mt-4">
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
    </Modal>
  );
};

NotificationsModal.propTypes = {
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
  onSelectNotification: PropTypes.func,
  onLoadMore: PropTypes.func.isRequired,
  hasMore: PropTypes.bool,
};

NotificationsModal.defaultProps = {
  notifications: [],
  loading: false,
  loadingMore: false,
  onSelectNotification: undefined,
  hasMore: false,
};

export default NotificationsModal;
