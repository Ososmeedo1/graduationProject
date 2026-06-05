import axios from './axios';

const normalizeEnvelope = (payload) => payload?.data?.data || payload?.data || payload || {};

export const getChats = async (params = {}) => {
  const payload = await axios.get('/admin/chats', { params });
  const normalized = normalizeEnvelope(payload);

  const data = Array.isArray(normalized?.items)
    ? normalized.items
    : Array.isArray(normalized?.data)
      ? normalized.data
      : Array.isArray(normalized)
        ? normalized
        : [];

  return {
    data,
    pagination: normalized?.pagination || {
      page: params.page || 1,
      pageSize: params.pageSize || 20,
      totalItems: data.length,
      totalPages: 1,
    },
  };
};

export const getChatMessages = async (bookingId, params = {}) => {
  const payload = await axios.get(`/admin/chats/${bookingId}/messages`, { params });
  const normalized = normalizeEnvelope(payload);

  return {
    bookingId,
    messages: Array.isArray(normalized?.items)
      ? normalized.items
      : Array.isArray(normalized?.messages)
        ? normalized.messages
        : Array.isArray(normalized)
          ? normalized
          : [],
  };
};

export const getChatByBookingId = async (bookingId) => {
  const payload = await axios.get(`/admin/chats/${bookingId}`);
  const normalized = normalizeEnvelope(payload);

  return {
    bookingId,
    data: normalized,
  };
};