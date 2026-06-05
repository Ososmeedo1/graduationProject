import axios from './axios';
import { getBookingStats } from './adminBookingsApi';
import { getSosStats } from './adminSosApi';

const safeArray = (value) => (Array.isArray(value) ? value : []);

const pickFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null);

const normalizeEnvelope = (payload) => payload?.result || payload?.data || payload;

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStats = (payload = {}) => {
  const data = normalizeEnvelope(payload) || {};

  return {
    totalHelpers: toNumber(
      pickFirstDefined(data.totalHelpers, data.TotalHelpers, data.helpersTotal)
    ),
    pendingReview: toNumber(
      pickFirstDefined(data.pendingReview, data.pendingReviews, data.pendingHelpers, data.PendingReview, data.PendingReviews, data.PendingHelpers)
    ),
    approved: toNumber(
      pickFirstDefined(data.approved, data.approvedHelpers, data.Approved, data.ApprovedHelpers)
    ),
    active: toNumber(
      pickFirstDefined(data.active, data.activeHelpers, data.Active, data.ActiveHelpers)
    ),
    suspended: toNumber(
      pickFirstDefined(data.suspended, data.suspendedHelpers, data.Suspended, data.SuspendedHelpers)
    ),
    banned: toNumber(
      pickFirstDefined(data.banned, data.bannedHelpers, data.Banned, data.BannedHelpers)
    ),
  };
};

const buildChartData = (stats) => {
  return [
    { name: 'Pending', value: stats.pendingReview },
    { name: 'Approved', value: stats.approved },
    { name: 'Active', value: stats.active },
    { name: 'Suspended', value: stats.suspended },
    { name: 'Banned', value: stats.banned },
  ];
};

export const getStats = async () => {
  const payload = await axios.get('/admin/dashboard/stats');
  return normalizeStats(payload);
};

export const getRecentHelpers = async () => {
  const payload = await axios.get('/admin/dashboard/recent-helpers');
  return safeArray(payload?.data || payload?.items || payload);
};

export const getRecentActions = async () => {
  const payload = await axios.get('/admin/dashboard/recent-actions');
  return safeArray(payload?.data || payload?.items || payload);
};

export const getAdminDashboardData = async () => {
  const [stats, recentHelpers, recentActions, bookingStats, sosStats] = await Promise.all([
    getStats(),
    getRecentHelpers(),
    getRecentActions(),
    getBookingStats().catch(() => ({})),
    getSosStats().catch(() => ({})),
  ]);

  return {
    stats,
    chartData: buildChartData(stats),
    recentHelpers,
    recentActions,
    bookingStats,
    sosStats,
  };
};
