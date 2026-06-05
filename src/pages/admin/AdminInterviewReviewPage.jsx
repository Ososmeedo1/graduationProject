import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminStateWrapper from '../../components/admin/AdminStateWrapper';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import InterviewTable from '../../components/admin/interviews/InterviewTable';
import { services } from '../../services';
import toast from 'react-hot-toast';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../config/permissions';

const AdminInterviewReviewPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { can } = usePermissions();
  const canView = can(PERMISSIONS.ADMIN_INTERVIEWS_VIEW);

  const [activeTab, setActiveTab] = useState('pending');
  const [pending, setPending] = useState([]);
  const [manual, setManual] = useState([]);
  const [loading, setLoading] = useState(false);
  const defaultFilters = {
    search: '',
    status: 'all',
    language: 'all',
    dateFrom: '',
    dateTo: '',
  };

  const [filters, setFilters] = useState(defaultFilters);
  const [localFilters, setLocalFilters] = useState(defaultFilters);

  const applyFilters = () => {
    setFilters(localFilters);
  };

  const clearFilters = () => {
    setLocalFilters(defaultFilters);
    setFilters(defaultFilters);
  };

  const fetchPending = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.interviews.getPendingInterviews();
      setPending(Array.isArray(data) ? data : []);
    } catch {
      toast.error(t('errors.fetchFailed', 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const fetchManual = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.interviews.getManualReviewInterviews();
      setManual(Array.isArray(data) ? data : []);
    } catch {
      toast.error(t('errors.fetchFailed', 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  const initialLoadRef = useRef(true);

  useEffect(() => {
    // Fetch both pending and manual interviews on initial load to show correct counts
    // Only run once on mount to avoid unnecessary re-fetches
    if (initialLoadRef.current) {
      const fetchInitialData = async () => {
        await Promise.all([fetchPending(), fetchManual()]);
      };
      fetchInitialData();
      initialLoadRef.current = false;
    }
  }, [fetchPending, fetchManual]);

  useEffect(() => {
    // Skip initial mount, only refetch when switching tabs after initial load
    if (initialLoadRef.current) {
      initialLoadRef.current = false;
      return;
    }
    if (activeTab === 'pending') {
      fetchPending();
    } else {
      fetchManual();
    }
  }, [activeTab, fetchPending, fetchManual]);

  useEffect(() => {
    const requestedTab = String(searchParams.get('tab') || '').toLowerCase();
    const helperId = searchParams.get('helperId') || '';

    if (requestedTab === 'manual') {
      setActiveTab('manual');
    }

    if (helperId) {
      setLocalFilters((prev) => ({ ...prev, search: helperId }));
      setFilters((prev) => ({ ...prev, search: helperId }));
    }
  }, [searchParams]);

  const currentData = useMemo(() => (activeTab === 'pending' ? pending : manual), [activeTab, pending, manual]);

  const languageOptions = useMemo(() => {
    const values = Array.from(new Set(currentData.map((item) => item.languageName).filter(Boolean)));
    return [{ value: 'all', label: t('common.all', 'All') }, ...values.map((value) => ({ value, label: value }))];
  }, [currentData, t]);

  const statusOptions = useMemo(() => ([
    { value: 'all', label: t('common.all', 'All') },
    { value: 'AwaitingHumanReview', label: t('interviews.pending', 'Awaiting Review') },
    { value: 'ManualReviewRequired', label: t('interviews.manualReview', 'Manual Review Required') },
    { value: 'Approved', label: t('interviews.approved', 'Approved') },
    { value: 'Rejected', label: t('interviews.rejected', 'Rejected') },
  ]), [t]);

  const filteredData = useMemo(() => {
    const term = filters.search.trim().toLowerCase();
    const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
    const to = filters.dateTo ? new Date(filters.dateTo) : null;
    if (to) to.setHours(23, 59, 59, 999);

    const normalizedStatusFilter = String(filters.status || '').trim().toLowerCase();
    const normalizedLanguageFilter = String(filters.language || '').trim().toLowerCase();

    return currentData.filter((item) => {
      if (term) {
        const hay = `${item.helperName || ''} ${item.userEmail || ''} ${item.helperId || ''} ${item.languageName || ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }

      if (filters.status !== 'all') {
        const itemStatus = String(item.status || '').trim().toLowerCase();
        if (itemStatus !== normalizedStatusFilter) return false;
      }

      if (filters.language !== 'all') {
        const itemLanguage = String(item.languageName || '').trim().toLowerCase();
        if (itemLanguage !== normalizedLanguageFilter) return false;
      }

      if (from || to) {
        const created = item.createdAt ? new Date(item.createdAt) : null;
        if (!created || Number.isNaN(created.getTime())) return false;
        if (from && created < from) return false;
        if (to && created > to) return false;
      }

      return true;
    });
  }, [currentData, filters]);

  if (!canView) {
    return (
      <AdminStateWrapper
        variant="forbidden"
        title={t('states.forbiddenTitle', 'Access Denied')}
        message={t('states.forbiddenView', 'You do not have permission to view this')}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-ink">{t('nav.interviews', 'Interviews')}</h1>
        <p className="text-sm text-ink-muted">{t('interviews.subtitle', 'Review language interviews after AI evaluation or manual review requirement.')}</p>
      </div>

      <Card>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === 'pending' ? 'bg-primary-600 text-white' : 'bg-surface-inset text-ink-muted'}`}
          >
            {t('interviews.pending', 'Awaiting Review')} ({pending.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`rounded-full px-4 py-2 text-sm font-medium ${activeTab === 'manual' ? 'bg-primary-600 text-white' : 'bg-surface-inset text-ink-muted'}`}
          >
            {t('interviews.manualReview', 'Manual Review Required')} ({manual.length})
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder={t('interviews.searchPlaceholder', 'Search helper, email, language...')}
            value={localFilters.search}
            onChange={(e) => setLocalFilters((prev) => ({ ...prev, search: e.target.value }))}
          />
          <Select
            options={statusOptions}
            value={localFilters.status}
            onChange={(e) => setLocalFilters((prev) => ({ ...prev, status: e.target.value }))}
          />
          <Select
            options={languageOptions}
            value={localFilters.language}
            onChange={(e) => setLocalFilters((prev) => ({ ...prev, language: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="date"
              value={localFilters.dateFrom}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, dateFrom: e.target.value }))}
              placeholder={t('interviews.dateFrom', 'From')}
            />
            <Input
              type="date"
              value={localFilters.dateTo}
              onChange={(e) => setLocalFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
              placeholder={t('interviews.dateTo', 'To')}
            />
          </div>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="primary" size="sm" onClick={applyFilters}>
            {t('common.search', 'Search')}
          </Button>
          <Button variant="outline" size="sm" onClick={clearFilters}>
            {t('common.clearFilters', 'Clear Filters')}
          </Button>
        </div>
      </Card>

      <div className="bg-surface shadow-sm rounded-lg border border-stroke overflow-hidden">
        <InterviewTable
          data={filteredData}
          isLoading={loading}
          onView={(row) => navigate(`/admin/interviews/${row.id}`)}
        />
      </div>
    </div>
  );
};

export default AdminInterviewReviewPage;
