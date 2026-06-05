import axios from './axios';

export const getPaymentById = async (id) => {
  const payload = await axios.get(`/admin/payments/${id}`);
  return payload?.data?.data || payload?.data || payload;
};

export const refundPayment = async (id, reason) => {
  const payload = await axios.post(`/admin/payments/${id}/refund`, { reason });
  return payload?.data?.data || payload?.data || payload;
};
