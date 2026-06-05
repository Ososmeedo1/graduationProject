import React, { Suspense, useMemo, useState, use } from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart3, Clock3, ShieldAlert, UserCheck } from 'lucide-react';
import KPICard from '../../components/dashboard/KPICard';
import Card from '../../components/ui/Card';
import ErrorState from '../../components/ui/ErrorState';
import { services } from '../../services';
import { formatDate } from '../../utils/formatters';

const StatsChart = React.lazy(() => import('../../components/dashboard/StatsChart'));

class DashboardErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error);
    }

    return this.props.children;
  }
}

const DashboardContent = ({ promise }) => {
  const { t } = useTranslation();
  const data = use(promise);

  const stats = data?.stats || {};
  const recentHelpers = data?.recentHelpers || [];
  const recentActions = data?.recentActions || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard title={t('adminDashboard.kpis.totalHelpers', 'Total Helpers')} value={stats.totalHelpers || 0} icon={UserCheck} color="primary" />
        <KPICard title={t('adminDashboard.kpis.pending', 'Pending Review')} value={stats.pendingReview || 0} icon={Clock3} color="warning" />
        <KPICard title={t('adminDashboard.kpis.approved', 'Approved')} value={stats.approved || 0} icon={BarChart3} color="success" />
        <KPICard title={t('adminDashboard.kpis.suspended', 'Suspended + Banned')} value={(stats.suspended || 0) + (stats.banned || 0)} icon={ShieldAlert} color="danger" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <StatsChart
          title={t('adminDashboard.chart.reviewStatus', 'Review Status Distribution')}
          data={data?.chartData || []}
          color="#0B3D91"
        />

        <div className="space-y-6 lg:col-span-1">
          <Card title={t('adminDashboard.recentHelpers', 'Recent Helpers')}>
            <ul className="space-y-3">
              {recentHelpers.slice(0, 5).map((helper) => (
                <li key={helper.id} className="rounded-md border border-stroke px-3 py-2">
                  <p className="text-sm font-medium text-ink">{helper.fullName || helper.name || helper.email}</p>
                  <p className="text-xs text-ink-muted">{helper.email}</p>
                </li>
              ))}
              {recentHelpers.length === 0 && (
                <li className="text-sm text-ink-muted">{t('common.noData', 'No data available')}</li>
              )}
            </ul>
          </Card>

          <Card title={t('adminDashboard.recentActions', 'Recent Actions')}>
            <ul className="space-y-3">
              {recentActions.slice(0, 5).map((action, index) => (
                <li key={action.id || index} className="rounded-md border border-stroke px-3 py-2">
                  <p className="text-sm font-medium text-ink">
                    {action.action || action.title || t('adminDashboard.actionLabel', 'Action')}
                  </p>
                  <p className="text-xs text-ink-muted">{formatDate(action.createdAt, 'medium')}</p>
                </li>
              ))}
              {recentActions.length === 0 && (
                <li className="text-sm text-ink-muted">{t('common.noData', 'No data available')}</li>
              )}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

const DashboardFallback = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-28 rounded-lg border border-stroke bg-surface p-4">
          <div className="mb-2 h-3 w-20 animate-pulse rounded bg-surface-inset" />
          <div className="h-8 w-24 animate-pulse rounded bg-surface-inset" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 mt-4">
      {[1, 2, 3, 4].map((item) => (
        <div key={item} className="h-28 rounded-lg border border-stroke bg-surface p-4">
          <div className="mb-2 h-3 w-20 animate-pulse rounded bg-surface-inset" />
          <div className="h-8 w-24 animate-pulse rounded bg-surface-inset" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="h-80 animate-pulse rounded-lg bg-surface-inset" />
      <div className="space-y-6 lg:col-span-1">
        {[1, 2].map((card) => (
          <div key={card} className="rounded-xl border border-stroke bg-surface p-4">
            <div className="mb-4 h-4 w-40 animate-pulse rounded bg-surface-inset" />
            <div className="space-y-3">
              {[1, 2, 3].map((row) => (
                <div key={row} className="h-10 animate-pulse rounded bg-surface-inset" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AdminDashboardPage = () => {
  const { t } = useTranslation();
  const [refreshKey, setRefreshKey] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const dashboardPromise = useMemo(() => services.dashboard.getAdminDashboardData(), [refreshKey]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t('adminDashboard.title', 'Admin Dashboard')}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {t('adminDashboard.subtitle', 'Real-time operational metrics and recent platform activity.')}
        </p>
      </div>

      <DashboardErrorBoundary
        resetKey={refreshKey}
        fallback={(error) => (
          <ErrorState
            title={t('errors.fetchFailed', 'Failed to fetch data')}
            message={error?.detail || error?.message}
            onRetry={() => setRefreshKey((prev) => prev + 1)}
          />
        )}
      >
        <Suspense fallback={<DashboardFallback />}>
          <DashboardContent promise={dashboardPromise} />
        </Suspense>
      </DashboardErrorBoundary>
    </div>
  );
};

export default AdminDashboardPage;
