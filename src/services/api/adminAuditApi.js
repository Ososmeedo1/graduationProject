import axios from './axios';

const pickFirstNonEmpty = (...values) => {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = typeof value === 'string' ? value.trim() : value;
    if (text !== '') return value;
  }
  return undefined;
};

const normalizeAuditItem = (item = {}) => {
  const adminObject = item.admin || item.performedByAdmin || item.actor || item.user || {};

  const adminName = pickFirstNonEmpty(
    item.adminName,
    item.adminFullName,
    item.adminUserName,
    item.performedBy,
    item.performedByName,
    item.actorName,
    item.userName,
    adminObject.fullName,
    adminObject.name,
    adminObject.userName,
    adminObject.username,
  ) || '-';

  const createdAt = pickFirstNonEmpty(
    item.createdAt,
    item.createdOn,
    item.timestamp,
    item.timeStamp,
    item.occurredAt,
    item.eventTime,
    item.date,
    item.time,
  ) || '';

  return {
    ...item,
    adminName,
    createdAt,
  };
};

const cleanQuery = (params = {}) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );
};

const normalizePagedResponse = (payload, fallbackPage, fallbackPageSize) => {
  const envelope = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload;

  const data = Array.isArray(envelope?.items)
    ? envelope.items
    : Array.isArray(envelope?.data)
      ? envelope.data
      : [];

  const normalizedData = data.map(normalizeAuditItem);

  const total = Number(envelope?.meta?.total || envelope?.totalCount || envelope?.total || normalizedData.length);
  const page = Number(envelope?.meta?.page || envelope?.page || fallbackPage || 1);
  const pageSize = Number(envelope?.meta?.limit || envelope?.pageSize || fallbackPageSize || 10);

  return {
    data: normalizedData,
    meta: {
      total,
      page,
      pageSize,
      totalPages: Number(envelope?.meta?.totalPages || envelope?.totalPages) || Math.max(1, Math.ceil(total / Math.max(1, pageSize))),
    },
  };
};

export const getAuditLogs = async (params = {}) => {
  const page = Number(params.Page || 1);
  const pageSize = Number(params.PageSize || 10);
  const payload = await axios.get('/admin/audit', { params: cleanQuery(params) });
  return normalizePagedResponse(payload, page, pageSize);
};

export const getHelperAuditLogs = async (helperId) => {
  const payload = await axios.get(`/admin/audit/helpers/${helperId}`);
  const envelope = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload;

  const items = Array.isArray(envelope)
    ? envelope
    : Array.isArray(envelope?.items)
      ? envelope.items
      : Array.isArray(envelope?.data)
        ? envelope.data
        : Array.isArray(envelope?.data?.items)
          ? envelope.data.items
          : [];

  return items.map(normalizeAuditItem);
};
