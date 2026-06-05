import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash, Shield, AlertTriangle } from 'lucide-react';
import Table from '../ui/Table';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

const UserTable = ({ data, isLoading, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const getRoleBadge = (role) => {
    const value = String(role || '').toLowerCase();
    if (value === 'superadmin' || value === 'super_admin' || value === 'super-admin') {
      return <Badge label="SuperAdmin" variant="warning" />;
    }
    return <Badge label="Admin" variant="danger" />;
  };

  const columns = [
    {
      header: t('users.fields.name', 'Name'),
      accessor: 'name',
      render: (row) => (
        <div>
          <div className="font-medium text-ink">{row.name}</div>
          <div className="text-ink-muted text-xs">{row.email}</div>
        </div>
      )
    },
    {
      header: t('users.fields.role', 'Role'),
      accessor: 'role',
      render: (row) => getRoleBadge(row.role),
    },
    {
      header: t('users.fields.status', 'Status'),
      accessor: 'status',
      render: (row) => (
        row.status === 'active'
          ? <span className="text-green-600 text-xs font-medium flex items-center gap-1">Active</span>
          : <span className="text-ink-muted text-xs font-medium flex items-center gap-1">Inactive</span>
      )
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: 'id',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(row)} title={t('common.edit')}>
            <Edit size={16} className="text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(row)} title={t('common.delete')}>
            <Trash size={16} className="text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
};

export default UserTable;
