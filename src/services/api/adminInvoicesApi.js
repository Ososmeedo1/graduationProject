import axios from './axios';
import { storage } from '../../utils/storage';

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.result?.items)) return payload.result.items;
  return [];
};

const normalizeInvoice = (item = {}) => ({
  id: item.invoiceId || item.id,
  invoiceNumber: item.invoiceNumber || '',
  bookingId: item.bookingId || '',
  userName: item.userName || item.user?.fullName || '',
  helperName: item.helperName || item.helper?.fullName || '',
  destinationCity: item.destinationCity || '',
  totalAmount: item.totalAmount || 0,
  currency: item.currency || 'USD',
  status: item.status || '',
  paymentStatus: item.paymentStatus || '',
  paymentMethod: item.paymentMethod || '',
  issuedAt: item.issuedAt || '',
  voidedAt: item.voidedAt || null,
  voidReason: item.voidReason || '',
});

export const getInvoices = async (params = {}) => {
  const payload = await axios.get('/admin/invoices', { params });
  const data = payload?.data || payload;
  return {
    items: toArray(payload).map(normalizeInvoice),
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 1,
  };
};

export const getInvoiceStats = async () => {
  const payload = await axios.get('/admin/invoices/stats');
  return payload?.data?.data || payload?.data || payload;
};

export const getInvoiceById = async (id) => {
  const payload = await axios.get(`/admin/invoices/${id}`);
  return payload?.data?.data || payload?.data || payload;
};

export const getInvoiceViewUrl = (id) => {
  const token = storage.getToken();
  // Append token as a query param since browser window.open doesn't support custom headers
  return `${axios.defaults.baseURL}/admin/invoices/${id}/view${token ? `?access_token=${token}` : ''}`;
};

export const voidInvoice = async (id, reason, refundPayment) => {
  const payload = await axios.post(`/admin/invoices/${id}/void`, { 
    reason, 
    refundPayment 
  });
  return payload?.data || payload;
};
