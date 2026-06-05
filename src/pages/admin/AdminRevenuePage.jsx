import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { TrendingUp, DollarSign, PieChart, BarChart3, RotateCcw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import KPICard from '../../components/dashboard/KPICard';
import Card from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import { services } from '../../services';
import { formatCurrency, formatDate } from '../../utils/formatters';

const AdminRevenuePage = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState('day');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [localGranularity, setLocalGranularity] = useState('day');
  const [localFrom, setLocalFrom] = useState('');
  const [localTo, setLocalTo] = useState('');
  const [data, setData] = useState(null);

  const fetchRevenue = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        granularity,
        from: from || undefined,
        to: to || undefined,
      };
      const result = await services.bookings.getRevenueAnalytics(params);
      setData(result);
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [granularity, from, to, t]);

  const applyFilters = () => {
    setGranularity(localGranularity);
    setFrom(localFrom);
    setTo(localTo);
  };

  const clearFilters = () => {
    setLocalGranularity('day');
    setLocalFrom('');
    setLocalTo('');
    setGranularity('day');
    setFrom('');
    setTo('');
  };

  const dateError = useMemo(() => {
    if (!localFrom || !localTo) return null;
    return new Date(localFrom) > new Date(localTo) ? t('common.invalidDateRange', 'From date must be before To date') : null;
  }, [localFrom, localTo, t]);

  const averageMetrics = useMemo(() => {
    if (!data?.buckets?.length || data.completedBookings === 0) {
      return { avgRevenue: 0, avgCommission: 0, avgPayout: 0 };
    }
    return {
      avgRevenue: data.totalRevenue / data.completedBookings,
      avgCommission: data.totalCommission / data.completedBookings,
      avgPayout: data.totalHelperPayout / data.completedBookings,
    };
  }, [data]);

  useEffect(() => {
    fetchRevenue();
  }, [fetchRevenue]);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  const chartData = data?.buckets?.map(item => ({
    name: formatDate(item.bucketStart, 'short'),
    revenue: item.revenue,
    commission: item.commission,
    payout: item.helperPayout,
  })) || [];

  return (
    <DirectionalWrapper className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('bookings.revenueTitle')}</h1>
          <p className="text-ink-muted">{t('reports.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <Input
              type="date"
              value={localFrom}
              onChange={(e) => setLocalFrom(e.target.value)}
              className="w-40"
              label={t('common.from')}
            />
            {dateError && <span className="text-xs text-red-500">{dateError}</span>}
          </div>
          <Input
            type="date"
            value={localTo}
            onChange={(e) => setLocalTo(e.target.value)}
            className="w-40"
            label={t('common.to')}
          />
          <Select
            options={[
              { value: 'day', label: t('common.daily') },
              { value: 'week', label: t('common.weekly') },
              { value: 'month', label: t('common.monthly') },
            ]}
            value={localGranularity}
            onChange={(e) => setLocalGranularity(e.target.value)}
            className="w-40"
            label={t('bookings.fields.period')}
          />
          <Button variant="primary" size="sm" onClick={applyFilters} className="mt-6" disabled={dateError}>
            {t('common.search', 'Search')}
          </Button>
          <Button variant="outline" size="sm" onClick={clearFilters} className="mt-6" disabled={!localFrom && !localTo && localGranularity === 'day'}>
            <RotateCcw size={14} className="mr-2" />
            {t('common.clearFilters', 'Clear')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('bookings.stats.revenueTotal')}
          value={formatCurrency(data?.totalRevenue || 0, data?.currency)}
          icon={TrendingUp}
          color="primary"
        />
        <KPICard
          title={t('bookings.stats.commissionTotal')}
          value={formatCurrency(data?.totalCommission || 0, data?.currency)}
          icon={DollarSign}
          color="success"
        />
        <KPICard
          title={t('bookings.stats.payoutTotal')}
          value={formatCurrency(data?.totalHelperPayout || 0, data?.currency)}
          icon={PieChart}
          color="warning"
        />
        <KPICard
          title={t('bookings.stats.total')}
          value={data?.completedBookings || 0}
          icon={BarChart3}
          color="info"
        />
      </div>

      {data?.completedBookings > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <KPICard
            title={t('bookings.stats.avgRevenue', 'Avg Revenue')}
            value={formatCurrency(averageMetrics.avgRevenue, data?.currency)}
            icon={TrendingUp}
            color="info"
          />
          <KPICard
            title={t('bookings.stats.avgCommission', 'Avg Commission')}
            value={formatCurrency(averageMetrics.avgCommission, data?.currency)}
            icon={DollarSign}
            color="info"
          />
          <KPICard
            title={t('bookings.stats.avgPayout', 'Avg Payout')}
            value={formatCurrency(averageMetrics.avgPayout, data?.currency)}
            icon={PieChart}
            color="info"
          />
        </div>
      )}

      {chartData.length > 0 ? (
        <Card title={t('bookings.revenueTitle')}>
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--card-border, #E5E7EB)" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#6B7280', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '8px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-color)',
                  }}
                  formatter={(value) => formatCurrency(value, data?.currency)}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="revenue" fill="#0B3D91" name={t('bookings.fields.revenue')} radius={[8, 8, 0, 0]} />
                <Line type="monotone" dataKey="commission" stroke="#10B981" strokeWidth={2} name={t('bookings.fields.commission')} />
                <Line type="monotone" dataKey="payout" stroke="#F59E0B" strokeWidth={2} name={t('bookings.fields.payout')} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-center py-12 text-ink-muted">
            <AlertCircle size={20} className="mr-2" />
            <span>{t('common.noData')}</span>
          </div>
        </Card>
      )}

      {data?.buckets?.length > 0 ? (
        <Card title={t('bookings.revenueBuckets', 'Revenue Details')}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-stroke">
              <thead className="bg-surface-muted">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                    {t('bookings.fields.period')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                    {t('bookings.fields.completedBookings')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                    {t('bookings.fields.revenue')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                    {t('bookings.fields.commission')}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase tracking-wider">
                    {t('bookings.fields.payout')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-stroke">
                {data?.buckets?.map((bucket, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-ink">
                      {formatDate(bucket.bucketStart, 'short')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-muted">
                      {bucket.completedBookings}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-muted">
                      {formatCurrency(bucket.revenue, data?.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-muted">
                      {formatCurrency(bucket.commission, data?.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-muted">
                      {formatCurrency(bucket.helperPayout, data?.currency)}
                    </td>
                  </tr>
                ))}
                {data?.completedBookings > 0 && (
                  <tr className="bg-surface-muted font-bold">
                    <td className="px-6 py-4 text-sm text-ink">{t('common.total', 'Total')}</td>
                    <td className="px-6 py-4 text-sm text-ink">{data.completedBookings}</td>
                    <td className="px-6 py-4 text-sm text-ink">{formatCurrency(data.totalRevenue, data?.currency)}</td>
                    <td className="px-6 py-4 text-sm text-ink">{formatCurrency(data.totalCommission, data?.currency)}</td>
                    <td className="px-6 py-4 text-sm text-ink">{formatCurrency(data.totalHelperPayout, data?.currency)}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="flex items-center justify-center py-12 text-ink-muted">
            <AlertCircle size={20} className="mr-2" />
            <span>{t('common.noDataForDateRange', 'No revenue data available for the selected date range')}</span>
          </div>
        </Card>
      )}
    </DirectionalWrapper>
  );
};

export default AdminRevenuePage;
