import axios from './axios';

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.result?.items)) return payload.result.items;
  return [];
};

const normalizeBooking = (item = {}) => ({
  id: item.id || item.bookingId || item.Id,
  userId: item.userId || item.user?.id,
  userName: item.userName || item.user?.fullName || item.user?.name || '',
  helperId: item.helperId || item.helper?.id,
  helperName: item.helperName || item.helper?.fullName || item.helper?.name || '',
  city: item.city || item.destinationCity || '',
  status: item.status || '',
  type: item.type || '',
  paymentStatus: item.paymentStatus || '',
  estimatedPrice: item.estimatedPrice || 0,
  finalPrice: item.finalPrice || 0,
  scheduledAt: item.scheduledAt || item.bookingTime || '',
  createdAt: item.createdAt || '',
  duration: item.duration || 0,
});

export const getBookings = async (params = {}) => {
  const payload = await axios.get('/admin/bookings', { params });
  const data = payload?.data || payload;
  return {
    items: toArray(payload).map(normalizeBooking),
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 1,
  };
};

export const getBookingById = async (id) => {
  const payload = await axios.get(`/admin/bookings/${id}`);
  return payload?.data?.data || payload?.data || payload;
};

export const getBookingStats = async () => {
  const payload = await axios.get('/admin/bookings/stats');
  return payload?.data?.data || payload?.data || payload;
};

export const getLiveBookings = async () => {
  const payload = await axios.get('/admin/bookings/live');
  return toArray(payload);
};

export const getRevenueAnalytics = async (params = {}) => {
  const payload = await axios.get('/admin/bookings/revenue', { params });
  return payload?.data?.data || payload?.data || payload;
};

export const getBookingActivity = async (id) => {
  const payload = await axios.get(`/admin/bookings/${id}/activity`);
  return toArray(payload);
};

export const getBookingDispatchLog = async (id) => {
  const payload = await axios.get(`/admin/bookings/${id}/dispatch-log`);
  return toArray(payload);
};

export const getBookingTracking = async (id) => {
  const payload = await axios.get(`/admin/bookings/${id}/tracking`);
  return payload?.data?.data || payload?.data || payload;
};

export const getBookingTrackingHistory = async (bookingId) => {
  const payload = await axios.get(`/booking/${bookingId}/tracking/history`);
  return payload?.data?.data || payload?.data || payload;
};

export const getBookingLatestTracking = async (id) => {
  const payload = await axios.get(`/admin/bookings/${id}/tracking/latest`);
  return payload?.data || payload;
};
