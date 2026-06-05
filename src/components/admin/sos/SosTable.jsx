import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import Table from '../../ui/Table';
import Button from '../../ui/Button';
import SosStatusBadge from './SosStatusBadge';
import { formatDate } from '../../../utils/formatters';

const SosTable = ({ data, isLoading, onView }) => {
  const { t } = useTranslation();

  const columns = [
    {
      header: t('sos.fields.triggerer'),
      accessor: 'triggeredByName',
      render: (row) => (
        <span>
          {row.triggeredByName !== 'Unknown' ? row.triggeredByName : row.triggeredByType}
        </span>
      ),
    },
    {
      header: t('sos.fields.counterparty'),
      accessor: 'counterpartyName',
    },
    {
      header: t('sos.fields.reason'),
      accessor: 'reason',
    },
    {
      header: t('sos.fields.status'),
      accessor: 'status',
      render: (row) => <SosStatusBadge status={row.status} />,
    },
    {
      header: t('sos.fields.createdAt'),
      accessor: 'createdAt',
      render: (row) => formatDate(row.createdAt, 'medium'),
    },
    {
      header: t('common.actions'),
      accessor: 'id',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onView(row)} title={t('sos.actions.view')}>
            <Eye size={16} className="text-ink-muted" />
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} emptyMessage={t('common.noData')} />;
};

export default SosTable;
