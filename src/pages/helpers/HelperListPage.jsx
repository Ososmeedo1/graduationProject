import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus } from 'lucide-react';
import Button from '../../components/ui/Button';
import HelperTable from '../../components/helpers/HelperTable';
import HelperCard from '../../components/helpers/HelperCard';
import HelperFilters from '../../components/helpers/HelperFilters';
import { services } from '../../services';
import toast from 'react-hot-toast';
import usePermissions from '../../hooks/usePermissions';
import useAlert from '../../hooks/useAlert';
import { PERMISSIONS } from '../../config/permissions';

const normalizeResponse = (response, page, limit) => {
  if (response && Array.isArray(response.data) && response.pagination) {
    return {
      data: response.data,
      pagination: {
        page: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.totalItems,
        pageSize: response.pagination.pageSize,
      },
    };
  }

  if (Array.isArray(response)) {
    return {
      data: response,
      pagination: {
        page,
        totalPages: 1,
        totalItems: response.length,
        pageSize: limit,
      },
    };
  }

  return {
    data: [],
    pagination: { page, totalPages: 1, totalItems: 0, pageSize: limit },
  };
};

const applyLocalFilters = (items, filters) => {
  let filtered = items;

  if (filters.hasCar !== 'all') {
    const wantsCar = filters.hasCar === 'yes';
    filtered = filtered.filter((item) => Boolean(item.hasCar) === wantsCar);
  }

  if (filters.hasDrugTest !== 'all') {
    const wantsDrugTest = filters.hasDrugTest === 'yes';
    filtered = filtered.filter((item) => Boolean(item.hasDrugTest) === wantsDrugTest);
  }

  return filtered;
};

const HelperListPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = usePermissions();
  const { confirm } = useAlert();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    approvalStatus: 'all',
    accountStatus: 'all',
    hasCar: 'all',
    hasDrugTest: 'all',
  });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0, limit: 10 });

  const fetchHelpers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        Search: filters.search,
        ApprovalStatus: filters.approvalStatus !== 'all' ? filters.approvalStatus : undefined,
        IsActive: filters.accountStatus === 'active' ? true : filters.accountStatus === 'inactive' ? false : undefined,
        IsSuspended: filters.accountStatus === 'suspended' ? true : undefined,
        IsBanned: filters.accountStatus === 'banned' ? true : undefined,
        Page: pagination.page,
        PageSize: pagination.limit,
      };

      const response = await services.helpers.getHelpers(params);
      const normalized = normalizeResponse(response, pagination.page, pagination.limit);
      const filtered = applyLocalFilters(normalized.data, filters);

      setData(filtered);
      setPagination((prev) => ({
        ...prev,
        page: normalized.pagination.page,
        totalPages: normalized.pagination.totalPages || 1,
        totalItems: normalized.pagination.totalItems || filtered.length,
      }));
    } catch {
      toast.error(t('errors.fetchFailed', 'Failed to fetch helpers'));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, t]);

  useEffect(() => {
    fetchHelpers();
  }, [fetchHelpers]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleView = (helper) => {
    navigate(`/helpers/${helper.id}`);
  };

  const handleEdit = (helper) => {
    navigate(`/helpers/${helper.id}/edit`);
  };

  const handleDelete = async (helper) => {
    const confirmed = await confirm({
      title: t('helpers.deleteTitle', 'Delete Helper'),
      message: t('helpers.deleteConfirm', 'Are you sure you want to delete "{{name}}"? This action cannot be undone.', {
        name: helper.fullName || helper.email,
      }),
      type: 'danger',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    });

    if (confirmed) {
      try {
        await services.helpers.deleteHelper(helper.id);
        toast.success(t('helpers.deleteSuccess', 'Helper deleted successfully'));
        fetchHelpers();
      } catch (error) {
        toast.error(error?.detail || error?.message || t('errors.deleteFailed', 'Failed to delete'));
      }
    }
  };

  const canCreate = can(PERMISSIONS.HELPER_CREATE);
  const canEdit = can(PERMISSIONS.HELPER_EDIT);
  const canDelete = can(PERMISSIONS.HELPER_DELETE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-ink">{t('helpers.title', 'Helpers')}</h1>
        {canCreate && (
          <Button onClick={() => navigate('/helpers/new')} icon={Plus}>
            {t('helpers.addNew', 'Add New Helper')}
          </Button>
        )}
      </div>

      <HelperFilters onFilter={handleFilterChange} initialFilters={filters} />

      <div className="hidden md:block bg-surface shadow-sm rounded-lg border border-stroke overflow-hidden">
        <HelperTable
          data={data}
          isLoading={loading}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          canEdit={canEdit}
          canDelete={canDelete}
        />
      </div>

      <div className="md:hidden space-y-4">
        {loading ? (
          <div className="text-center py-10 text-ink-muted">{t('common.loading', 'Loading...')}</div>
        ) : data.length > 0 ? (
          data.map((helper) => (
            <HelperCard
              key={helper.id}
              helper={helper}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))
        ) : (
          <div className="text-center py-10 text-ink-muted">{t('common.noData')}</div>
        )}
      </div>

      <div className="flex justify-between items-center bg-surface p-4 rounded-lg border border-stroke">
        <Button
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
        >
          {t('common.previous', 'Previous')}
        </Button>
        <span className="text-sm text-ink-muted">
          {t('common.pageOf', { page: pagination.page, total: pagination.totalPages || 1 })}
        </span>
        <Button
          variant="outline"
          disabled={pagination.page >= (pagination.totalPages || 1)}
          onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
        >
          {t('common.next', 'Next')}
        </Button>
      </div>
    </div>
  );
};

export default HelperListPage;
