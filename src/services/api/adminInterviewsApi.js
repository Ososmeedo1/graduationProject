import axios from './axios';

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.data?.items)) return payload.data.data.items;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.result?.items)) return payload.result.items;
  return [];
};

const normalizeInterview = (item = {}) => ({
  id: item.id || item.interviewId || item.Id,
  helperId: item.helperId || item.helper?.id,
  helperName: item.helperName || item.helperFullName || item.fullName || item.helper?.fullName || item.helper?.name || '',
  userEmail: item.userEmail || item.email || item.helper?.email || '',
  languageName: item.languageName || item.language || item.languageCode || item.helperLanguage || '',
  status: item.status || item.newStatus || item.reviewStatus || item.state || '',
  aiScore: item.aiScore ?? item.score ?? item.evaluationScore ?? null,
  createdAt: item.createdAt || item.createdOn || item.submittedAt || '',
});

export const getPendingInterviews = async () => {
  const payload = await axios.get('/admin/interviews/pending');
  return toArray(payload).map(normalizeInterview);
};

export const getManualReviewInterviews = async () => {
  const payload = await axios.get('/admin/interviews/manual-review');
  return toArray(payload).map(normalizeInterview);
};

export const getInterviewById = async (id) => {
  const payload = await axios.get(`/admin/interviews/${id}`);
  return payload?.data?.data || payload?.data || payload;
};

export const getInterviewsByHelper = async (helperId) => {
  const payload = await axios.get(`/admin/interviews/by-helper/${helperId}`);
  return toArray(payload).map(normalizeInterview);
};

export const approveInterview = async (id) => {
  const actionResult = await axios.post(`/admin/interviews/${id}/approve`);
  return { success: true, id, actionResult };
};

export const rejectInterview = async (id, payload = {}) => {
  const actionResult = await axios.post(`/admin/interviews/${id}/reject`, payload);
  return { success: true, id, actionResult };
};

export const reprocessInterview = async (id) => {
  const actionResult = await axios.post(`/admin/interviews/${id}/reprocess`);
  return { success: true, id, actionResult };
};
