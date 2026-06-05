import axios from './axios';

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  return [];
};

const normalizeSos = (item = {}) => ({
  id: item.id || '',
  bookingId: item.bookingId || '',
  bookingStatusAtTrigger: item.bookingStatusAtTrigger || '',
  triggeredByType: item.triggeredByType || 'User',
  triggeredById: item.triggeredById || '',
  triggeredByName: item.triggeredByName || 'Unknown',
  triggeredByContact: item.triggeredByContact || '',
  counterpartyType: item.counterpartyType || '',
  counterpartyId: item.counterpartyId || '',
  counterpartyName: item.counterpartyName || 'N/A',
  counterpartyContact: item.counterpartyContact || '',
  reason: item.reason || 'No reason provided',
  note: item.note || '',
  latitude: item.latitude || 0,
  longitude: item.longitude || 0,
  locationAt: item.locationAt || '',
  locationSource: item.locationSource || '',
  status: item.status || 'Active',
  resolutionNote: item.resolutionNote || '',
  resolutionAction: item.resolutionAction || '',
  handledByAdminId: item.handledByAdminId || '',
  resolvedAt: item.resolvedAt || null,
  createdAt: item.createdAt || '',
});

export const getSosList = async (params = {}) => {
  const payload = await axios.get('/admin/sos', { params });
  const response = payload?.data?.data || payload?.data || payload;
  const items = Array.isArray(response?.items) ? response.items : (Array.isArray(response) ? response : []);
  
  return {
    items: items.map(normalizeSos),
    total: response?.total || items.length,
    page: response?.page || 1,
    pageSize: response?.pageSize || items.length,
  };
};

export const getActiveSosPaginated = async (page = 1, pageSize = 20) => {
  return await getSosList({ status: 'Active', page, pageSize });
};

export const getActiveSos = async (limit = 50) => {
  const payload = await axios.get('/admin/sos/active', { params: { limit } });
  const response = payload?.data?.data || payload?.data || payload;
  const items = Array.isArray(response?.items) ? response.items : (Array.isArray(response) ? response : []);
  
  return {
    items: items.map(normalizeSos),
    total: response?.total || items.length,
  };
};

export const getSosById = async (id) => {
  const payload = await axios.get(`/admin/sos/${id}`);
  const data = payload?.data?.data || payload?.data || payload;
  return normalizeSos(data);
};

export const resolveSos = async (id, { finalStatus, resolutionNote, action }) => {
  const payload = await axios.patch(`/admin/sos/${id}/resolve`, {
    finalStatus,
    resolutionNote,
    action,
  });
  const data = payload?.data?.data || payload?.data || payload;
  return normalizeSos(data);
};

export const getSosStats = async () => {
  const payload = await axios.get('/admin/sos/stats');
  return payload?.data?.data || payload?.data || {};
};
