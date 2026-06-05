/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { toast } from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import { useSound } from './SoundContext';
import notificationsService from '../services/notificationsService';
import { startConnection, stopConnection, on as onHubEvent, onReconnected } from '../services/signalr/adminHub';

const DEFAULT_PAGE_SIZE = 25;

export const NotificationsContext = createContext(null);

const getNotificationId = (notification) => {
  return (
    notification?.id ||
    notification?.notificationId ||
    notification?._id ||
    notification?.Id ||
    ''
  );
};

const normalizeNotification = (notification) => {
  const id = getNotificationId(notification);
  return {
    ...notification,
    id,
    title: notification?.title || notification?.subject || notification?.Title || 'Notification',
    message:
      notification?.message ||
      notification?.body ||
      notification?.content ||
      notification?.description ||
      notification?.Message ||
      '',
    isRead:
      notification?.isRead ??
      notification?.read ??
      notification?.IsRead ??
      notification?.is_read ??
      false,
    createdAt:
      notification?.createdAt ||
      notification?.CreatedAt ||
      notification?.timestamp ||
      notification?.time ||
      notification?.date,
    targetType:
      notification?.targetType ||
      notification?.TargetType ||
      notification?.payload?.targetType ||
      notification?.payload?.TargetType ||
      notification?.data?.targetType ||
      notification?.data?.TargetType ||
      '',
    targetId:
      notification?.targetId ||
      notification?.TargetId ||
      notification?.payload?.targetId ||
      notification?.payload?.TargetId ||
      notification?.data?.targetId ||
      notification?.data?.TargetId ||
      '',
  };
};

export const NotificationsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { play } = useSound();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 1,
  });
  const lastFetchRef = useRef({ isRead: undefined, pageSize: DEFAULT_PAGE_SIZE });

  const hydrateNotifications = useCallback((items = [], { page, pageSize, total, totalPages }) => {
    const normalized = items.map(normalizeNotification);
    setNotifications(normalized);
    setPageInfo({ page, pageSize, total, totalPages });
  }, []);

  const appendNotifications = useCallback((items = [], { page, pageSize, total, totalPages }) => {
    const normalized = items.map(normalizeNotification);
    setNotifications((prev) => {
      const existingIds = new Set(prev.map((item) => item.id));
      const merged = [...prev];
      normalized.forEach((item) => {
        if (!item.id || existingIds.has(item.id)) return;
        merged.push(item);
      });
      return merged;
    });
    setPageInfo({ page, pageSize, total, totalPages });
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return 0;
    try {
      const count = await notificationsService.getUnreadCount();
      const safeCount = Number.isFinite(Number(count)) ? Number(count) : 0;
      setUnreadCount(safeCount);
      return safeCount;
    } catch (error) {
      if ([0, 404, 405, 501, 502, 503].includes(error?.status)) {
        setUnreadCount(0);
        return 0;
      }
      toast.error(error?.detail || 'Failed to load unread notifications.');
      return 0;
    }
  }, [isAuthenticated]);

  const fetchNotifications = useCallback(async (params = {}) => {
    if (!isAuthenticated) return;
    const request = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? pageInfo.pageSize,
      isRead: params.isRead,
    };
    lastFetchRef.current = { isRead: request.isRead, pageSize: request.pageSize };
    setLoading(true);
    try {
      const response = await notificationsService.getNotifications(request);
      hydrateNotifications(response.items || response.data || [], response.meta || {
        page: request.page,
        pageSize: request.pageSize,
        total: 0,
        totalPages: 1,
      });
      // Sync badge from response unreadCount (per documented response format)
      if (Number.isFinite(Number(response.unreadCount))) {
        setUnreadCount(Number(response.unreadCount));
      }
    } catch (error) {
      if ([0, 404, 405, 501, 502, 503].includes(error?.status)) {
        hydrateNotifications([], {
          page: request.page,
          pageSize: request.pageSize,
          total: 0,
          totalPages: 1,
        });
        return;
      }
      toast.error(error?.detail || 'Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, [hydrateNotifications, isAuthenticated, pageInfo.pageSize]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore) return;
    if (pageInfo.page >= pageInfo.totalPages) return;
    const nextPage = pageInfo.page + 1;
    setLoadingMore(true);
    try {
      const response = await notificationsService.getNotifications({
        page: nextPage,
        pageSize: pageInfo.pageSize,
        isRead: lastFetchRef.current.isRead,
      });
      appendNotifications(response.data || [], response.meta || {
        page: nextPage,
        pageSize: pageInfo.pageSize,
        total: pageInfo.total,
        totalPages: pageInfo.totalPages,
      });
    } catch (error) {
      toast.error(error?.detail || 'Failed to load more notifications.');
    } finally {
      setLoadingMore(false);
    }
  }, [appendNotifications, loading, loadingMore, pageInfo.page, pageInfo.pageSize, pageInfo.total, pageInfo.totalPages]);

  const markAsRead = useCallback(async (id) => {
    if (!id) return;
    let wasUnread = false;
    setNotifications((prev) => prev.map((item) => {
      if (item.id !== id) return item;
      if (!item.isRead) {
        wasUnread = true;
      }
      return { ...item, isRead: true };
    }));
    if (wasUnread) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await notificationsService.markAsRead(id);
    } catch (error) {
      toast.error(error?.detail || 'Failed to update notification.');
      fetchUnreadCount();
      fetchNotifications({ page: 1, pageSize: pageInfo.pageSize, isRead: lastFetchRef.current.isRead });
    }
  }, [fetchNotifications, fetchUnreadCount, pageInfo.pageSize]);

  const addIncomingNotification = useCallback((notification) => {
    const normalized = normalizeNotification(notification);
    if (!normalized.id) {
      normalized.id = `temp-${Date.now()}`;
    }

    // Per spec section 6: de-duplication semantics
    // If same ID exists, replace it. Otherwise prepend and increment badge.
    let isNewNotification = false;
    setNotifications((prev) => {
      const existingIdx = prev.findIndex((item) => item.id === normalized.id);
      if (existingIdx >= 0) {
        // Replace existing notification (de-duplication refresh)
        const updated = [...prev];
        updated[existingIdx] = normalized;
        return updated;
      }
      // New notification: prepend
      isNewNotification = true;
      return [normalized, ...prev];
    });

    // Only increment badge for truly new unread notifications
    if (isNewNotification && !normalized.isRead) {
      setUnreadCount((prev) => prev + 1);
    }

    if (normalized.message || normalized.title) {
      toast.success(normalized.message || normalized.title);
    } else {
      toast.success('New notification received.');
    }

    play('entry');
  }, [play]);

  const handleHelperReady = useCallback((payload) => {
    const message = payload?.message || 'A helper is ready for review.';
    toast(message);
    play('entry');
    fetchUnreadCount();
  }, [fetchUnreadCount, play]);

  const handleInterviewReady = useCallback((payload) => {
    const message = payload?.message || 'An interview is awaiting review.';
    toast(message);
    play('entry');
    fetchUnreadCount();
  }, [fetchUnreadCount, play]);

  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      setPageInfo({ page: 1, pageSize: DEFAULT_PAGE_SIZE, total: 0, totalPages: 1 });
      stopConnection();
      return;
    }

    fetchUnreadCount();

    const connect = async () => {
      await startConnection();
    };

    connect();

    const unsubscribeNotification = onHubEvent('AdminNotificationCreated', addIncomingNotification);
    const unsubscribeHelper = onHubEvent('AdminHelperReadyForReview', handleHelperReady);
    const unsubscribeInterview = onHubEvent('AdminInterviewAwaitingReview', handleInterviewReady);
    const unsubscribeReconnected = onReconnected(() => {
      fetchNotifications({ page: 1, pageSize: lastFetchRef.current.pageSize, isRead: lastFetchRef.current.isRead });
    });

    return () => {
      unsubscribeNotification();
      unsubscribeHelper();
      unsubscribeInterview();
      unsubscribeReconnected();
      stopConnection();
    };
  }, [addIncomingNotification, fetchNotifications, fetchUnreadCount, handleHelperReady, handleInterviewReady, isAuthenticated]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    loadingMore,
    hasMore: pageInfo.page < pageInfo.totalPages,
    fetchNotifications,
    loadMore,
    fetchUnreadCount,
    markAsRead,
  }), [fetchNotifications, fetchUnreadCount, loadMore, loading, loadingMore, markAsRead, notifications, pageInfo.page, pageInfo.totalPages, unreadCount]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

NotificationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
