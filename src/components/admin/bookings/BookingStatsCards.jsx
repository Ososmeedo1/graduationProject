import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, TrendingUp, MapPin, Clock3, ShieldAlert, DollarSign, UserCheck } from 'lucide-react';
import KPICard from '../../dashboard/KPICard';
import Card from '../../ui/Card';
import { formatCurrency } from '../../../utils/formatters';

const BookingStatsCards = ({ bookingStats, currency }) => {
  const { t } = useTranslation();

  if (!bookingStats) return null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title={t('bookings.stats.total', 'Total Bookings')}
          value={bookingStats.totalBookings || 0}
          icon={Calendar}
          color="info"
        />
        <KPICard
          title={t('bookings.stats.today', 'Today')}
          value={bookingStats.totalToday || 0}
          icon={TrendingUp}
          color="warning"
        />
        <KPICard
          title={t('bookings.stats.thisWeek', 'This Week')}
          value={bookingStats.totalThisWeek || 0}
          icon={Calendar}
          color="warning"
        />
        <KPICard
          title={t('bookings.stats.thisMonth', 'This Month')}
          value={bookingStats.totalThisMonth || 0}
          icon={Calendar}
          color="warning"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mt-4">
        <KPICard
          title={t('bookings.stats.active', 'Active Trips')}
          value={bookingStats.activeTripsNow || 0}
          icon={MapPin}
          color="primary"
        />
        <KPICard
          title={t('bookings.stats.pendingRequests', 'Pending Requests')}
          value={bookingStats.pendingRequestsNow || 0}
          icon={Clock3}
          color="warning"
        />
        <KPICard
          title={t('bookings.stats.awaitingPayment', 'Awaiting Payment')}
          value={bookingStats.awaitingPaymentNow || 0}
          icon={ShieldAlert}
          color="info"
        />
        <KPICard
          title={t('bookings.stats.completionRate', 'Completion Rate')}
          value={`${bookingStats.completionRatePercentage || 0}%`}
          icon={UserCheck}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mt-4">
        <KPICard
          title={t('bookings.stats.revenueTotal', 'Total Revenue')}
          value={formatCurrency(bookingStats.totalRevenueCompleted || 0, currency)}
          icon={DollarSign}
          color="success"
        />
        <KPICard
          title={t('bookings.stats.commissionTotal', 'Total Commission')}
          value={formatCurrency(bookingStats.rafiqCommissionTotal || 0, currency)}
          icon={DollarSign}
          color="danger"
        />
        <KPICard
          title={t('bookings.stats.payoutTotal', 'Total Payout')}
          value={formatCurrency(bookingStats.helperPayoutTotal || 0, currency)}
          icon={DollarSign}
          color="success"
        />
        <KPICard
          title={t('bookings.stats.avgTripPrice', 'Avg Trip Price')}
          value={formatCurrency(bookingStats.averageCompletedTripPrice || 0, currency)}
          icon={TrendingUp}
          color="info"
        />
        <KPICard
          title={t('bookings.stats.cancellationRate', 'Cancellation Rate')}
          value={`${bookingStats.cancellationRatePercentage || 0}%`}
          icon={ShieldAlert}
          color="danger"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
        <Card title={t('bookings.stats.byStatus', 'Bookings By Status')}>
          <ul className="space-y-2">
            {Object.entries(bookingStats.byStatus || {}).map(([status, count]) => (
              <li key={status} className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">{t(`bookings.status.${status}`, status)}</span>
                <span className="font-medium text-ink">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t('bookings.stats.byType', 'Bookings By Type')}>
          <ul className="space-y-2">
            {Object.entries(bookingStats.byType || {}).map(([type, count]) => (
              <li key={type} className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">{t(`bookings.type.${type}`, type)}</span>
                <span className="font-medium text-ink">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t('bookings.stats.byPaymentStatus', 'Bookings By Payment Status')}>
          <ul className="space-y-2">
            {Object.entries(bookingStats.byPaymentStatus || {}).map(([paymentStatus, count]) => (
              <li key={paymentStatus} className="flex justify-between items-center text-sm">
                <span className="text-ink-muted">{t(`bookings.paymentStatus.${paymentStatus}`, paymentStatus)}</span>
                <span className="font-medium text-ink">{count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
};

export default BookingStatsCards;
