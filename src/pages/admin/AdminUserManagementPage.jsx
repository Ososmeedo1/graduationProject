import React, { Suspense, useEffect, useMemo, useOptimistic, useState, use } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import AdminStateWrapper from '../../components/admin/AdminStateWrapper';
import UserForm from '../../components/admin/management/UserForm';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import { services } from '../../services';
import usePermissions from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../config/permissions';

const ManagementTable = ({ promise, optimisticUsers, onEdit, canManage, page = 1, pageSize = 10, onPageChange = () => {} }) => {
  const { t } = useTranslation();
  const baseUsers = use(promise);
  const merged = [...optimisticUsers, ...baseUsers.filter((item) => !optimisticUsers.some((opt) => opt.id === item.id))];
  const totalItems = merged.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = merged.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    if (currentPage !== page) {
      onPageChange(currentPage);
    }
  }, [currentPage, onPageChange, page]);

  if (merged.length === 0) {
    return (
      <AdminStateWrapper
        variant="empty"
        compact
        title={t('states.noResultsTitle', 'No results found')}
        message={t('adminManagement.emptyUsers', 'No administrator records found')}
      />
    );
  }

  const columns = [
    { header: t('users.name', 'Name'), accessor: 'fullName' },
    { header: t('users.email', 'Email'), accessor: 'email' },
    { header: t('users.role', 'Role'), accessor: 'role' },
    {
      header: t('users.status', 'Status'),
      accessor: 'isActive',
      render: (row) => (
        <span className={`rounded-full px-2 py-1 text-xs font-medium ${row.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-surface-inset text-ink-muted'}`}>
          {row.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
        </span>
      ),
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: 'actions',
      align: 'right',
      render: (row) => (
        <div className="flex items-center justify-end gap-2">
          {canManage && (
            <>
              <button
                type="button"
                onClick={() => onEdit(row)}
                className="rounded-md border border-stroke px-2.5 py-1 text-xs font-medium text-ink-muted hover:bg-surface-inset"
              >
                {t('common.edit', 'Edit')}
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <Table columns={columns} data={pageItems} emptyMessage={t('common.noData', 'No data available')} />
      <div className="flex items-center justify-between rounded-lg border border-stroke bg-surface p-4">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          {t('common.previous', 'Previous')}
        </Button>
        <span className="text-sm text-ink-muted">
          {t('common.pageOf', { page: currentPage, total: totalPages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          {t('common.next', 'Next')}
        </Button>
      </div>
    </div>
  );
};

const AdminUserManagementPage = () => {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.ADMIN_MANAGE);

  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const usersPromise = useMemo(() => services.admins.getAdmins(), [refreshKey]);
  const [optimisticUsers, applyOptimistic] = useOptimistic([], (state, update) => update(state));

  const openCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleSubmit = async (payload) => {
    if (!canManage) {
      toast.error(t('errors.forbidden', 'Access denied'));
      return;
    }

    const isEdit = Boolean(editingUser?.id);
    const optimisticId = editingUser?.id || `tmp-${Date.now()}`;
    const optimisticRecord = {
      id: optimisticId,
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
      isActive: payload.status === 'active',
    };

    applyOptimistic((prev) => {
      const withoutCurrent = prev.filter((item) => item.id !== optimisticId);
      return [optimisticRecord, ...withoutCurrent];
    });

    try {
      if (isEdit) {
        await services.admins.updateAdmin(editingUser.id, {
          role: payload.role,
          isActive: payload.status === 'active',
        });
      } else {
        await services.admins.createAdmin(payload);
        setPagination((prev) => ({ ...prev, page: 1 }));
      }

      toast.success(isEdit ? t('users.updateSuccess', 'User updated successfully') : t('users.createSuccess', 'User created successfully'));
      closeModal();
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.updateFailed', 'Failed to update'));
      setRefreshKey((prev) => prev + 1);
    }
  };

  return (
    <DirectionalWrapper className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('nav.adminManagement', 'Admin Management')}</h1>
          <p className="mt-1 text-sm text-ink-muted">{t('adminManagement.subtitle', 'Manage administrator accounts and access roles.')}</p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            {t('users.addNew', 'Add New User')}
          </button>
        )}
      </div>

      <Suspense fallback={<div className="rounded-xl border border-stroke bg-surface p-4 text-sm text-ink-muted">{t('adminManagement.loading', 'Loading users...')}</div>}>
        <ManagementTable
          promise={usersPromise}
          optimisticUsers={optimisticUsers}
          onEdit={openEdit}
          canManage={canManage}
          page={pagination.page}
          pageSize={pagination.limit}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
        />
      </Suspense>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? t('users.editUser', 'Edit User') : t('users.newUser', 'New User')}
      >
        <div className="text-start">
          <UserForm
            initialValues={editingUser}
            isEdit={Boolean(editingUser)}
            onSubmit={handleSubmit}
            onCancel={closeModal}
          />
        </div>
      </Modal>
    </DirectionalWrapper>
  );
};

export default AdminUserManagementPage;