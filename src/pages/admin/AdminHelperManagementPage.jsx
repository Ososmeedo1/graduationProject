import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import AdminStateWrapper from '../../components/admin/AdminStateWrapper';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import HelperFilters from '../../components/helpers/HelperFilters';
import HelperTable from '../../components/helpers/HelperTable';
import HelperCard from '../../components/helpers/HelperCard';
import { services } from '../../services';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../config/permissions';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';

const PAGINATION_STORAGE_KEY = 'admin_helper_management_pagination';

const normalizeResponse = (result) => {
  return {
    data: result.data || [],
    pagination: result.pagination || { page: 1, totalPages: 1, totalItems: 0, pageSize: 10 },
  };
};

const AdminHelperManagementPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canAny } = usePermissions();
  const canReview = canAny([PERMISSIONS.ADMIN_MANAGE, PERMISSIONS.OPERATIONS_REVIEW]);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    approvalStatus: 'all',
    accountStatus: 'all',
  });
  const [pagination, setPagination] = useState(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(PAGINATION_STORAGE_KEY) : null;
    return stored ? { page: 1, totalPages: 1, totalItems: 0, limit: 10, ...JSON.parse(stored) } : { page: 1, totalPages: 1, totalItems: 0, limit: 10 };
  });

  const fetchHelpers = useCallback(async (currentPage) => {
    try {
      setLoading(true);
      const result = await services.helpers.getHelpers({
        Search: filters.search,
        ApprovalStatus: filters.approvalStatus !== 'all' ? filters.approvalStatus : undefined,
        IsActive: filters.accountStatus === 'active' ? true : filters.accountStatus === 'inactive' ? false : undefined,
        IsSuspended: filters.accountStatus === 'suspended' ? true : undefined,
        IsBanned: filters.accountStatus === 'banned' ? true : undefined,
        Page: currentPage,
        PageSize: pagination.limit,
      });

      const normalized = normalizeResponse(result);
      
      setData(normalized.data.map((item) => ({ ...item, approvalStatus: item.approvalStatus || item.status })));
      setPagination((prev) => ({
        ...prev,
        page: normalized.pagination.page,
        totalPages: normalized.pagination.totalPages || 1,
        totalItems: normalized.pagination.totalItems,
      }));
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed', 'Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit, t]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  useEffect(() => {
    fetchHelpers(pagination.page);
  }, [fetchHelpers, pagination.page]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PAGINATION_STORAGE_KEY, JSON.stringify({ page: pagination.page, limit: pagination.limit }));
    }
  }, [pagination.page, pagination.limit]);

  const handleView = (helper) => {
    navigate(`/helpers/${helper.id}`);
  };

  return (
    <DirectionalWrapper className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-ink">{t('helpers.title', 'Helpers')}</h1>
      </div>

      <HelperFilters onFilter={handleFilterChange} initialFilters={filters} />

      <div className="hidden md:block">
        <div className="bg-surface shadow-sm rounded-lg border border-stroke overflow-hidden">
          {canReview ? (
            <HelperTable
              data={data}
              isLoading={loading}
              onView={handleView}
            />
          ) : (
            <AdminStateWrapper
              variant="forbidden"
              compact
              title={t('states.forbiddenTitle', 'Access Denied')}
              message={t('states.forbiddenView', 'You do not have permission to view this')}
            />
          )}
        </div>
      </div>

      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-10 text-ink">{t('common.loading', 'Loading...')}</div>
        ) : data.length > 0 ? (
          data.map((helper) => (
            <HelperCard
              key={helper.id}
              helper={helper}
              onView={handleView}
            />
          ))
        ) : (
          <AdminStateWrapper
            variant="empty"
            compact
            title={t('states.noResultsTitle', 'No results found')}
            message={t('helperReview.emptyQueue', 'No helpers found in the review queue')}
          />
        )}
      </div>

      <div className="flex justify-between items-center bg-surface p-4 rounded-lg border border-stroke">
        <Button
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          {t('common.previous', 'Previous')}
        </Button>
        <span className="text-sm text-ink-muted">
          {t('common.pageOf', { page: pagination.page, total: pagination.totalPages || 1 })}
        </span>
        <Button
          variant="outline"
          disabled={pagination.page >= (pagination.totalPages || 1)}
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          {t('common.next', 'Next')}
        </Button>
      </div>

    </DirectionalWrapper>
  );
};

export default AdminHelperManagementPage;