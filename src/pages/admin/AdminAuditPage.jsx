import React, { Suspense, useMemo, useState, use } from 'react';
import { useTranslation } from 'react-i18next';
import Table from '../../components/ui/Table';
import AdminStateWrapper from '../../components/admin/AdminStateWrapper';
import { services } from '../../services';
import { formatDate } from '../../utils/formatters';

const defaultFilters = {
  Page: 1,
  PageSize: 10,
};

class AuditErrorBoundary extends React.Component {
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

const AuditTable = ({ promise, onPageChange }) => {
  const { t } = useTranslation();
  const result = use(promise);

  const rows = result?.data || [];
  const meta = result?.meta || { page: 1, pageSize: 10, total: rows.length, totalPages: 1 };

  const columns = [
    { header: t('audit.table.action', 'Action'), accessor: 'action' },
    { header: t('audit.table.targetType', 'Target Type'), accessor: 'targetType' },
    {
      header: t('audit.table.admin', 'Admin'),
      accessor: 'adminName',
      render: (row) => row.adminName || row.adminFullName || row.performedByName || row.actorName || row.userName || '-',
    },
    {
      header: t('audit.table.createdAt', 'Created At'),
      accessor: 'createdAt',
      render: (row) => formatDate(row.createdAt, 'medium'),
    },
  ];

  return (
    <div className="space-y-3 rounded-xl border border-stroke bg-surface p-4">
      {rows.length === 0 ? (
        <AdminStateWrapper
          variant="empty"
          compact
          title={t('states.noResultsTitle', 'No results found')}
          message={t('audit.emptyPeriod', 'No audit logs found for this period')}
        />
      ) : (
        <Table columns={columns} data={rows} emptyMessage={t('common.noData', 'No data available')} />
      )}
      <div className="flex items-center justify-between text-sm text-ink-muted">
        <span>{t('common.pageOf', 'Page {{page}} of {{total}}', { page: meta.page, total: meta.totalPages || 1 })}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-stroke px-3 py-1.5 text-ink-muted disabled:opacity-50"
            onClick={() => onPageChange(Math.max(1, Number(meta.page) - 1))}
            disabled={Number(meta.page) <= 1}
          >
            {t('common.previous', 'Previous')}
          </button>
          <button
            type="button"
            className="rounded-md border border-stroke px-3 py-1.5 text-ink-muted disabled:opacity-50"
            onClick={() => onPageChange(Math.min(Number(meta.totalPages || 1), Number(meta.page) + 1))}
            disabled={Number(meta.page) >= Number(meta.totalPages || 1)}
          >
            {t('common.next', 'Next')}
          </button>
        </div>
      </div>
    </div>
  );
};

const AuditTableFallback = () => (
  <div className="space-y-3 rounded-xl border border-stroke bg-surface p-4">
    <div className="overflow-x-auto rounded-lg border border-stroke">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700 bg-surface text-sm">
        <thead className="bg-surface-muted">
          <tr>
            {[1, 2, 3, 4, 5].map((cell) => (
              <th key={cell} className="px-4 py-3">
                <div className="h-3 animate-pulse rounded bg-surface-inset" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-700 bg-surface">
          {[1, 2, 3, 4, 5].map((row) => (
            <tr key={row}>
              {[1, 2, 3, 4, 5].map((cell) => (
                <td key={`${row}-${cell}`} className="px-4 py-3">
                  <div className="h-3 animate-pulse rounded bg-surface-inset" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminAuditPage = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(defaultFilters);
  const [refreshKey, setRefreshKey] = useState(0);

  const auditPromise = useMemo(() => {
    void refreshKey;
    return services.audit.getAuditLogs(filters);
  }, [filters, refreshKey]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">{t('nav.audit_logs', 'Audit Logs')}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {t('audit.subtitle', 'Track and review administrative actions across the platform.')}
        </p>
      </div>

      <AuditErrorBoundary
        resetKey={refreshKey}
        fallback={(error) => (
          <AdminStateWrapper
            variant="error"
            title={t('errors.fetchFailed', 'Failed to fetch data')}
            message={error?.detail || error?.message}
            onRetry={() => setRefreshKey((prev) => prev + 1)}
          />
        )}
      >
        <Suspense fallback={<AuditTableFallback />}>
          <AuditTable
            promise={auditPromise}
            onPageChange={(nextPage) => setFilters((prev) => ({ ...prev, Page: nextPage }))}
          />
        </Suspense>
      </AuditErrorBoundary>
    </div>
  );
};

export default AdminAuditPage;
