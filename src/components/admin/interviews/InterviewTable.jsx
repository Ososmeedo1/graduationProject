import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import Table from '../../ui/Table';
import Badge from '../../ui/Badge';
import Button from '../../ui/Button';

const toStatusVariant = (status) => {
  const value = String(status || '').toLowerCase();
  if (value.includes('awaiting')) return 'warning';
  if (value.includes('manual')) return 'danger';
  if (value.includes('approved')) return 'success';
  if (value.includes('rejected')) return 'danger';
  return 'info';
};

const InterviewTable = ({ data, isLoading, onView }) => {
  const { t } = useTranslation();

  const columns = [
    {
      header: t('interviews.helper', 'Helper'),
      accessor: 'helperName',
      className: 'font-medium text-ink',
      render: (row) => (
        <div>{row.helperName || t('helpers.unknown', 'Unknown')}</div>
      ),
    },
    {
      header: t('interviews.language', 'Language'),
      accessor: 'languageName',
      render: (row) => row.languageName || '-',
    },
    {
      header: t('interviews.status', 'Status'),
      accessor: 'status',
      render: (row) => (
        <Badge label={row.status || t('common.na', 'N/A')} variant={toStatusVariant(row.status)} />
      ),
    },
    {
      header: t('interviews.aiScore', 'AI Score'),
      accessor: 'aiScore',
      render: (row) => (row.aiScore === null || row.aiScore === undefined ? '-' : row.aiScore),
    },
    {
      header: t('interviews.createdAt', 'Created'),
      accessor: 'createdAt',
      render: (row) => row.createdAt ? new Date(row.createdAt).toLocaleString() : '-',
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: 'id',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => onView(row)} title={t('common.view')}>
            <Eye size={16} className="text-ink-muted" />
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
};

export default InterviewTable;
