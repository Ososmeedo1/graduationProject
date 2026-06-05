import React, { Suspense, use, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';
import AdminStateWrapper from '../../components/admin/AdminStateWrapper';
import ReportFilterForm from '../../components/admin/reports/ReportFilterForm';
import ReportExportToolbar from '../../components/admin/reports/ReportExportToolbar';
import { services } from '../../services';
import { exportRowsToCsv, printReport } from '../../utils/reportExport';
import { formatNumber } from '../../utils/formatters';

const defaultFilters = {
  startDate: '',
  endDate: '',
  category: 'helpers',
  status: 'all',
};

class ReportsErrorBoundary extends React.Component {
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

const toQuery = (filters) => {
  const query = {
    StartDate: filters.startDate || undefined,
    EndDate: filters.endDate || undefined,
    Status: filters.status === 'all' ? undefined : filters.status,
  };

  return query;
};

const ReportTableSection = ({ title, columns, rows, emptyMessage }) => {
  if (!rows.length) {
    return (
      <Card title={title} className="report-print-surface">
        <AdminStateWrapper
          variant="empty"
          compact
          title={emptyMessage}
          message={emptyMessage}
        />
      </Card>
    );
  }

  return (
    <Card title={title} className="report-print-surface">
      <Table columns={columns} data={rows} emptyMessage={emptyMessage} />
    </Card>
  );
};

const ReportsContent = ({ promise }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const data = use(promise);

  const helperColumns = [
    { header: t('helperReview.helper', 'Helper'), accessor: 'helperName' },
    { header: t('common.status', 'Status'), accessor: 'status' },
    { header: t('reports.completedTrips', 'Completed Trips'), accessor: 'completedTrips', align: 'right', render: (row) => formatNumber(row.completedTrips) },
    { header: t('reports.rating', 'Rating'), accessor: 'rating', align: 'right', render: (row) => Number(row.rating || 0).toFixed(1) },
    { header: t('reports.incidentReports', 'Incident Reports'), accessor: 'incidentReports', align: 'right', render: (row) => formatNumber(row.incidentReports) },
  ];

  const reportColumns = [
    { header: t('reports.reason', 'Reason'), accessor: 'reason' },
    { header: t('reports.reporter', 'Reporter'), accessor: 'reporterName' },
    { header: t('reports.target', 'Target'), accessor: 'targetName' },
    {
      header: t('common.status', 'Status'),
      accessor: 'status',
      render: (row) => row.status || (row.isResolved ? t('reports.resolved', 'Resolved') : t('reports.unresolved', 'Unresolved')),
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: 'actions',
      align: 'right',
      render: (row) => (
        <Button
          size="sm"
          variant="outline"
          onClick={(event) => {
            event.stopPropagation();
            navigate(`/admin/reports/${row.id}`);
          }}
        >
          {t('common.details', 'Details')}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <ReportTableSection
        title={t('reports.reportCases', 'Report Cases')}
        columns={reportColumns}
        rows={data.reports || []}
        emptyMessage={t('common.noData', 'No data available')}
      />
    </div>
  );
};

const ReportsFallback = () => (
  <div className="space-y-4">
    {[1].map((block) => (
      <div key={block} className="rounded-xl border border-stroke bg-surface p-4">
        <div className="mb-3 h-4 w-44 animate-pulse rounded bg-surface-inset" />
        <div className="overflow-x-auto rounded-lg border border-stroke">
          <table className="min-w-full divide-y divide-stroke bg-surface text-sm">
            <thead className="bg-surface-muted">
              <tr>
                {[1, 2, 3, 4].map((cell) => (
                  <th key={cell} className="px-4 py-3">
                    <div className="h-3 animate-pulse rounded bg-surface-inset" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke bg-surface">
              {[1, 2, 3].map((row) => (
                <tr key={row}>
                  {[1, 2, 3, 4].map((cell) => (
                    <td key={`${row}-${cell}`} className="px-4 py-3">
                      <div className="h-3 animate-pulse rounded bg-surface-muted" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
);

const AdminReportsPage = () => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState(defaultFilters);
  const [refreshKey, setRefreshKey] = useState(0);

  const reportsPromise = useMemo(() => {
    void refreshKey;
    return services.reports.getReportBundle(toQuery(filters));
  }, [filters, refreshKey]);

  const handleExportCsv = async () => {
    try {
      const data = await services.reports.getReportBundle(toQuery(filters));
      exportRowsToCsv('helper-analytics', [
        { header: t('helperReview.helper', 'Helper'), getValue: (row) => row.helperName },
        { header: t('common.status', 'Status'), getValue: (row) => row.status },
        { header: t('reports.completedTrips', 'Completed Trips'), getValue: (row) => row.completedTrips },
        { header: t('reports.rating', 'Rating'), getValue: (row) => row.rating },
        { header: t('reports.incidentReports', 'Incident Reports'), getValue: (row) => row.incidentReports },
      ], data.helpers || []);
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed', 'Failed to fetch data'));
    }
  };

  return (
    <div className="space-y-6 report-print-surface">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('nav.adminReports', 'Admin Reports')}</h1>
          <p className="mt-1 text-sm text-ink-muted">{t('reports.subtitle', 'Track helper analytics using live data.')}</p>
        </div>

        <div className="no-print">
          <ReportExportToolbar onExportCsv={handleExportCsv} onPrint={printReport} />
        </div>
      </div>

      <div className="no-print">
        <ReportFilterForm defaultFilters={filters} onApply={setFilters} />
      </div>

      <ReportsErrorBoundary
        resetKey={refreshKey}
        fallback={(error) => (
          <AdminStateWrapper
            variant="error"
            title={t('errors.fetchFailed', 'Failed to fetch data')}
            message={error?.detail || error?.message}
            onRetry={() => {
              setRefreshKey((prev) => prev + 1);
            }}
          />
        )}
      >
        <Suspense fallback={<ReportsFallback />}>
          <ReportsContent promise={reportsPromise} />
        </Suspense>
      </ReportsErrorBoundary>
    </div>
  );
};

export default AdminReportsPage;
