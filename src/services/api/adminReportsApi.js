import axios from './axios';

const cleanQuery = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)
  );

const toArray = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.data?.items)) return payload.data.items;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  if (Array.isArray(payload?.data?.data?.items)) return payload.data.data.items;
  if (Array.isArray(payload?.result)) return payload.result;
  if (Array.isArray(payload?.result?.items)) return payload.result.items;
  return [];
};

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const toIsoDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
};

const parseStatusFilter = (params = {}) => {
  const raw = String(params.isResolved ?? params.IsResolved ?? params.status ?? params.Status ?? '').trim().toLowerCase();
  if (!raw) return undefined;
  if (raw === 'true' || raw === 'resolved') return true;
  if (raw === '1') return true;
  if (raw === 'false' || raw === 'unresolved' || raw === 'pending') return false;
  if (raw === '0') return false;
  return undefined;
};

const applyDateRangeFilter = (rows, params = {}) => {
  const startRaw = params.StartDate || params.startDate;
  const endRaw = params.EndDate || params.endDate;

  const start = startRaw ? new Date(startRaw) : null;
  const end = endRaw ? new Date(endRaw) : null;

  return rows.filter((item) => {
    const value = new Date(item.createdAt || item.updatedAt || item.date || 0);
    if (Number.isNaN(value.getTime())) return true;
    if (start && value < start) return false;
    if (end && value > end) return false;
    return true;
  });
};

const normalizeReport = (item = {}) => ({
  id: item.id || item.reportId || item.Id || '',
  direction: item.direction || item.Direction || '',
  bookingId: item.bookingId || item.BookingId || '',
  reporterType: item.reporterType || item.ReporterType || '',
  reporterId: item.reporterId || item.ReporterId || '',
  reporterName: item.reporterName || item.ReporterName || item.reportedBy || item.ReportedBy || '',
  reporterContact: item.reporterContact || item.ReporterContact || '',
  targetType: item.targetType || item.TargetType || '',
  targetId: item.targetId || item.TargetId || '',
  targetName: item.targetName || item.TargetName || '',
  targetContact: item.targetContact || item.TargetContact || '',
  helperId: item.helperId || item.HelperId || item.helper?.id || item.helper?.Id || '',
  helperName: item.helperName || item.HelperName || item.name || item.helper?.fullName || item.helper?.name || 'Helper',
  reason: item.reason || item.Reason || '',
  details: item.details || item.Details || '',
  evidence: Array.isArray(item.evidence || item.Evidence) ? (item.evidence || item.Evidence) : [],
  reportedBy: item.reportedBy || item.ReportedBy || item.reporterName || item.ReporterName || '',
  status: item.status || item.Status || '',
  isResolved: (item.isResolved ?? item.IsResolved ?? false) === true,
  resolutionNote: item.resolutionNote || item.ResolutionNote || '',
  resolutionAction: item.resolutionAction || item.ResolutionAction || item.action || item.Action || '',
  resolvedByAdminId: item.resolvedByAdminId || item.ResolvedByAdminId || '',
  createdAt: item.createdAt || item.CreatedAt,
  resolvedAt: item.resolvedAt || item.ResolvedAt,
  updatedAt: item.updatedAt || item.UpdatedAt,
});

const toPagedPayload = (payload, fallbackPage = 1, fallbackPageSize = 20) => {
  const envelope = payload?.data && typeof payload.data === 'object' && !Array.isArray(payload.data)
    ? payload.data
    : payload;
  const items = toArray(payload).map(normalizeReport);
  const page = Number(envelope?.page ?? fallbackPage);
  const pageSize = Number(envelope?.pageSize ?? fallbackPageSize);
  const total = Number(envelope?.totalCount ?? envelope?.total ?? items.length);

  return {
    items,
    data: items,
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Number(envelope?.totalPages) || Math.ceil(total / Math.max(1, pageSize))),
    },
  };
};

const toQueryDateTime = (value, endOfDay = false) => {
  if (!value) return undefined;
  if (typeof value === 'string' && value.includes('T')) return value;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  }
  return date.toISOString();
};

const buildReportsQuery = (params = {}) => {
  const rawStatus = String(params.status ?? params.Status ?? '').trim();
  const lowered = rawStatus.toLowerCase();
  const isResolved = parseStatusFilter(params);

  const status = ['open', 'underreview', 'resolved', 'dismissed'].includes(lowered)
    ? lowered.charAt(0).toUpperCase() + lowered.slice(1)
    : undefined;

  return cleanQuery({
    status,
    isResolved,
    direction: params.direction ?? params.Direction,
    reason: params.reason ?? params.Reason,
    targetType: params.targetType ?? params.TargetType,
    targetId: params.targetId ?? params.TargetId,
    bookingId: params.bookingId ?? params.BookingId,
    from: toQueryDateTime(params.from ?? params.From ?? params.startDate ?? params.StartDate, false),
    to: toQueryDateTime(params.to ?? params.To ?? params.endDate ?? params.EndDate, true),
    page: params.page ?? params.Page,
    pageSize: params.pageSize ?? params.PageSize,
  });
};

export const getReportsList = async (params = {}) => {
  const page = Number(params.page ?? params.Page ?? 1);
  const pageSize = Number(params.pageSize ?? params.PageSize ?? 20);
  const payload = await axios.get('/admin/reports', {
    params: buildReportsQuery(params),
  });

  return toPagedPayload(payload, page, pageSize);
};

export const getReportById = async (id) => {
  const payload = await axios.get(`/admin/reports/${id}`);
  const row = payload?.data || payload;
  return normalizeReport(row || {});
};

const fetchReports = async (params = {}) => {
  const response = await getReportsList({
    ...params,
    page: params.page ?? params.Page ?? 1,
    pageSize: params.pageSize ?? params.PageSize ?? 100,
  });
  return applyDateRangeFilter(response.items, params);
};

const normalizeBooking = (item = {}) => ({
  period: item.period || item.date || '',
  destination: item.destination || item.tripDestination || item.label || '',
  bookings: toNumber(item.bookings || item.totalBookings || item.count),
  cancelled: toNumber(item.cancelled || item.cancelledBookings),
  completed: toNumber(item.completed || item.completedBookings),
  revenue: toNumber(item.revenue || item.totalRevenue),
});

const normalizeFinance = (item = {}) => ({
  period: item.period || item.date || '',
  revenue: toNumber(item.revenue || item.totalRevenue),
  expenses: toNumber(item.expenses || item.totalExpenses),
  net: toNumber(item.net || item.netProfit || toNumber(item.revenue) - toNumber(item.expenses)),
});

const normalizeHelper = (item = {}) => ({
  helperName: item.helperName || item.name || '',
  status: item.status || item.approvalStatus || 'Pending',
  completedTrips: toNumber(item.completedTrips || item.completed || item.trips),
  rating: toNumber(item.rating || item.averageRating),
  incidentReports: toNumber(item.incidentReports || item.reports),
});

export const getBookingSummaries = async (params = {}) => {
  const reports = await fetchReports(params);
  const grouped = reports.reduce((acc, item) => {
    const period = toIsoDate(item.createdAt) || 'Unknown';
    if (!acc[period]) {
      acc[period] = {
        period,
        destination: 'N/A',
        bookings: 0,
        cancelled: 0,
        completed: 0,
        revenue: 0,
      };
    }

    acc[period].bookings += 1;
    if (item.isResolved) acc[period].completed += 1;
    return acc;
  }, {});

  return Object.values(grouped).map(normalizeBooking);
};

export const getFinancialSummary = async (params = {}) => {
  const bookings = await getBookingSummaries(params);
  return bookings.map((item) =>
    normalizeFinance({
      period: item.period,
      revenue: 0,
      expenses: 0,
      net: 0,
    })
  );
};

export const getHelperAnalytics = async (params = {}) => {
  const reports = await fetchReports(params);
  const grouped = reports.reduce((acc, item) => {
    const key = item.helperId || item.helperName;
    if (!key) return acc;

    if (!acc[key]) {
      acc[key] = {
        helperName: item.helperName || 'Helper',
        status: item.isResolved ? 'Resolved' : 'Pending',
        completedTrips: 0,
        rating: 0,
        incidentReports: 0,
      };
    }

    acc[key].incidentReports += 1;
    if (item.isResolved) {
      acc[key].completedTrips += 1;
    } else {
      acc[key].status = 'Pending';
    }

    return acc;
  }, {});

  return Object.values(grouped).map(normalizeHelper);
};

export const getAdminReportsData = async (params = {}) => {
  const reports = await fetchReports(params);

  const groupedByPeriod = reports.reduce((acc, item) => {
    const period = toIsoDate(item.createdAt) || 'Unknown';
    if (!acc[period]) {
      acc[period] = { period, destination: 'N/A', bookings: 0, cancelled: 0, completed: 0, revenue: 0 };
    }
    acc[period].bookings += 1;
    if (item.isResolved) acc[period].completed += 1;
    return acc;
  }, {});

  const bookings = Object.values(groupedByPeriod).map(normalizeBooking);
  const finances = bookings.map((item) => normalizeFinance({ period: item.period, revenue: 0, expenses: 0, net: 0 }));

  const groupedHelpers = reports.reduce((acc, item) => {
    const key = item.helperId || item.helperName;
    if (!key) return acc;

    if (!acc[key]) {
      acc[key] = {
        helperName: item.helperName || 'Helper',
        status: item.isResolved ? 'Resolved' : 'Pending',
        completedTrips: 0,
        rating: 0,
        incidentReports: 0,
      };
    }

    acc[key].incidentReports += 1;
    if (item.isResolved) {
      acc[key].completedTrips += 1;
    } else {
      acc[key].status = 'Pending';
    }

    return acc;
  }, {});

  const helpers = Object.values(groupedHelpers).map(normalizeHelper);

  return {
    bookings,
    finances,
    helpers,
    reports,
  };
};

export const resolveReport = async (id, payload = {}) => {
  const body = typeof payload === 'string'
    ? { resolutionNote: payload }
    : {
      resolutionNote: payload?.resolutionNote || '',
      action: payload?.action || undefined,
    };

  const response = await axios.patch(`/admin/reports/${id}/resolve`, body);
  const row = response?.data || response;
  return normalizeReport(row || { id, ...body, isResolved: true, status: 'Resolved' });
};
