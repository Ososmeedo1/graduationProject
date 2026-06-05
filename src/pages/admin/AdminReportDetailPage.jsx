import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import AdminStateWrapper from '../../components/admin/AdminStateWrapper';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../config/permissions';
import { services } from '../../services';

const formatDateTime = (value, locale = 'en-GB') => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const AdminReportDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.ADMIN_REPORTS_VIEW);

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionAction, setResolutionAction] = useState('');

  const locale = i18n.language === 'ar' ? 'ar-EG' : 'en-GB';

  const fetchReport = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await services.reports.getReportById(id);
      setReport(data || null);
      setResolutionNote(data?.resolutionNote || '');
      setResolutionAction(data?.resolutionAction || '');
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed', 'Failed to fetch data'));
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [id, t]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const isClosed = useMemo(() => {
    const value = String(report?.status || '').toLowerCase();
    return value === 'resolved' || value === 'dismissed' || report?.isResolved === true;
  }, [report?.isResolved, report?.status]);

  const handleResolve = async () => {
    if (!id || !resolutionNote.trim()) {
      toast.error(t('reports.resolutionRequired', 'Resolution note is required.'));
      return;
    }

    try {
      setActionLoading(true);
      const updated = await services.reports.resolveReport(id, {
        resolutionNote: resolutionNote.trim(),
        action: resolutionAction.trim() || undefined,
      });
      setReport(updated);
      toast.success(t('reports.resolveSuccess', 'Report resolved successfully.'));
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.updateFailed', 'Failed to update'));
    } finally {
      setActionLoading(false);
    }
  };

  if (!canView) {
    return (
      <AdminStateWrapper
        variant="forbidden"
        title={t('states.forbiddenTitle', 'Access Denied')}
        message={t('states.forbiddenView', 'You do not have permission to view this')}
      />
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-ink">{t('common.loading', 'Loading...')}</div>;
  }

  if (!report) {
    return (
      <AdminStateWrapper
        variant="not-found"
        title={t('reports.reportNotFound', 'Report not found')}
        message={t('reports.reportNotFoundMsg', 'The report may have been removed or does not exist.')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/admin/reports')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-ink">{t('reports.reportDetails', 'Report Details')}</h1>
          </div>
        </div>
        <span className="rounded-full bg-surface-inset px-3 py-1 text-xs font-semibold text-ink-muted">
          {report.status || (report.isResolved ? t('reports.resolved', 'Resolved') : t('reports.unresolved', 'Unresolved'))}
        </span>
      </div>

      <Card title={t('reports.summary', 'Summary')}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-ink-muted">{t('reports.reason', 'Reason')}</p>
            <p className="mt-1 text-sm text-ink">{report.reason || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-muted">{t('reports.direction', 'Direction')}</p>
            <p className="mt-1 text-sm text-ink">{report.direction || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-muted">{t('reports.reporter', 'Reporter')}</p>
            <p className="mt-1 text-sm text-ink">{report.reporterName || '-'}</p>
            <p className="text-xs text-ink-muted">{report.reporterContact || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-muted">{t('reports.target', 'Target')}</p>
            <p className="mt-1 text-sm text-ink">{report.targetName || '-'}</p>
            <p className="text-xs text-ink-muted">{report.targetType || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-muted">{t('reports.createdAt', 'Created At')}</p>
            <p className="mt-1 text-sm text-ink">{formatDateTime(report.createdAt, locale)}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-ink-muted">{t('reports.resolvedAt', 'Resolved At')}</p>
            <p className="mt-1 text-sm text-ink">{formatDateTime(report.resolvedAt, locale)}</p>
          </div>
        </div>

        <div className="mt-5 space-y-4 border-t border-stroke pt-4">
          <div>
            <p className="text-xs font-semibold text-ink-muted">{t('reports.details', 'Details')}</p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink">{report.details || '-'}</p>
          </div>
          {Array.isArray(report.evidence) && report.evidence.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-ink-muted">{t('reports.evidence', 'Evidence')}</p>
              <ul className="mt-2 space-y-1">
                {report.evidence.map((item, idx) => (
                  <li key={`${item}-${idx}`}>
                    <a href={item} target="_blank" rel="noreferrer" className="text-sm text-primary-600 hover:underline">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      <Card title={t('reports.resolveReport', 'Resolve Report')}>
        <div className="space-y-3">
          <div>
            <label htmlFor="resolution-note" className="mb-1 block text-sm font-medium text-ink">
              {t('reports.resolutionNote', 'Resolution Note')}
            </label>
            <textarea
              id="resolution-note"
              rows={4}
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder={t('reports.resolutionPlaceholder', 'Describe the resolution taken...')}
              disabled={isClosed || actionLoading}
              className="w-full rounded-xl border border-stroke bg-surface px-3 py-2 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="resolution-action" className="mb-1 block text-sm font-medium text-ink">
              {t('reports.actionTag', 'Action Tag (optional)')}
            </label>
            <input
              id="resolution-action"
              type="text"
              maxLength={64}
              value={resolutionAction}
              onChange={(e) => setResolutionAction(e.target.value)}
              placeholder={t('reports.actionPlaceholder', 'Warning, Suspended, Banned, Refunded...')}
              disabled={isClosed || actionLoading}
              className="w-full rounded-xl border border-stroke bg-surface px-3 py-2 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-1">
            <Button
              variant="outline"
              onClick={fetchReport}
              disabled={actionLoading}
            >
              {t('common.refresh', 'Refresh')}
            </Button>
            <Button
              onClick={handleResolve}
              isLoading={actionLoading}
              disabled={isClosed || actionLoading}
            >
              {t('reports.markResolved', 'Mark as Resolved')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminReportDetailPage;
