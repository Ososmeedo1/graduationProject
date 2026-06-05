import axios from './api/axios';
import './api/interceptors';

const cleanQuery = (params = {}) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
};

const normalizePagedResponse = (payload, fallbackPage, fallbackPageSize) => {
  // Axios interceptor unwraps the HTTP response body.
  // Supported shapes:
  // 1) { data: { items, page, pageSize, unreadCount, ... } }
  // 2) { items, page, pageSize, unreadCount, ... }
  const envelope = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload;

  const items = Array.isArray(envelope?.items)
    ? envelope.items
    : Array.isArray(envelope?.data)
      ? envelope.data
      : [];
  const page = Number(envelope?.page ?? fallbackPage ?? 1);
  const pageSize = Number(envelope?.pageSize ?? fallbackPageSize ?? 25);
  const unreadCount = Number(envelope?.unreadCount ?? 0);
  const total = Number(envelope?.totalCount ?? envelope?.total ?? items.length);

  return {
    items,
    data: items,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Number(envelope?.totalPages) || Math.max(1, Math.ceil(total / Math.max(1, pageSize))),
    },
    unreadCount,
  };
};

export const getNotifications = async (params = {}) => {
  const page = Number(params.page || 1);
  const pageSize = Number(params.pageSize || 25);
  const payload = await axios.get('/admin/notifications', { params: cleanQuery(params) });
  return normalizePagedResponse(payload, page, pageSize);
};

export const getUnreadCount = async () => {
  const payload = await axios.get('/admin/notifications/unread-count');
  const envelope = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload;
  return Number(envelope?.unreadCount ?? envelope?.count ?? 0);
};

export const markAsRead = async (id) => {
  if (!id) return null;
  return axios.post(`/admin/notifications/${id}/read`);
};

const notificationsService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
};

export default notificationsService;
