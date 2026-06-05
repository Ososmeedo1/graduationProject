import React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit, Trash, Eye, Car } from 'lucide-react';
import Table from '../ui/Table';
import Button from '../ui/Button';
import HelperStatusBadge from '../admin/management/HelperStatusBadge';

const HelperTable = ({ data, isLoading, onView }) => {
  const { t } = useTranslation();

  const columns = [
    {
      header: t('helpers.fields.name', 'Helper'),
      accessor: 'fullName',
      className: 'font-medium text-ink',
      render: (row) => (
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-surface-inset flex items-center justify-center text-xs font-bold text-ink-muted mr-3 rtl:ml-3">
            {(row.fullName || row.email || '?').charAt(0)}
          </div>
          <div>
            <div>{row.fullName || t('helpers.unknown', 'Unknown')}</div>
          </div>
        </div>
      ),
    },
    {
      header: t('helpers.fields.email', 'Email'),
      accessor: 'email',
    },
    {
      header: t('helpers.fields.approvalStatus', 'Approval Status'),
      accessor: 'approvalStatus',
      render: (row) => <HelperStatusBadge status={row.approvalStatus || row.status} />,
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: 'id',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => onView(row)} title={t('common.view')}>
            <Eye size={16} className="text-ink-muted" />
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
};

export default HelperTable;
