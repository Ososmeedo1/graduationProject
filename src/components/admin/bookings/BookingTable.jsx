import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye } from 'lucide-react';
import Table from '../../ui/Table';
import Button from '../../ui/Button';
import { formatDate, formatCurrency } from '../../../utils/formatters';

const BookingTable = ({ data, isLoading, onView }) => {
  const { t } = useTranslation();

  const columns = [
    {
      header: t('bookings.fields.user', 'User'),
      accessor: 'userName',
      render: (row) => (
        <span className="font-medium">{row.userName}</span>
      ),
    },
    {
      header: t('bookings.fields.helper', 'Helper'),
      accessor: 'helperName',
      render: (row) => (
        <span className="font-medium">{row.helperName || t('common.na', 'N/A')}</span>
      ),
    },
    {
      header: t('bookings.fields.destination', 'Destination'),
      accessor: 'city',
    },
    {
      header: t('bookings.fields.price', 'Price'),
      accessor: 'finalPrice',
      render: (row) => formatCurrency(row.finalPrice || row.estimatedPrice),
    },
    {
      header: t('common.actions', 'Actions'),
      accessor: 'actions',
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

export default BookingTable;
