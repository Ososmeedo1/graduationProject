import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../ui/Card';
import Table from '../../ui/Table';
import { formatDate } from '../../../utils/formatters';

const BookingDispatchLog = ({ logs }) => {
  const { t } = useTranslation();

  const columns = [
    {
      header: '#',
      accessor: 'attemptOrder',
      className: 'font-mono text-xs w-10',
    },
    {
      header: t('bookings.fields.attemptType'), // Display attemptType
      accessor: 'attemptType',
      className: 'text-xs',
    },
    {
      header: t('common.status'),
      accessor: 'responseStatus',
      render: (row) => (
        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
          row.responseStatus === 'Accepted' ? 'bg-green-100 text-green-800' :
          row.responseStatus === 'Rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {row.responseStatus}
        </span>
      ),
    },
    {
      header: t('bookings.fields.sentAt'), // Display sentAt
      accessor: 'sentAt',
      render: (row) => formatDate(row.sentAt, 'medium'),
      className: 'text-xs',
    },
    {
      header: t('bookings.fields.respondedAt'), // Display respondedAt
      accessor: 'respondedAt',
      render: (row) => row.respondedAt ? formatDate(row.respondedAt, 'medium') : t('common.na'),
      className: 'text-xs',
    },
    {
      header: t('bookings.fields.expiresAt'), // Display expiresAt
      accessor: 'expiresAt',
      render: (row) => row.expiresAt ? formatDate(row.expiresAt, 'medium') : t('common.na'),
      className: 'text-xs',
    },
    {
      header: t('bookings.fields.helperLocation'), // Display helperLatitude and helperLongitude
      accessor: 'helperLocation',
      render: (row) => row.helperLatitude && row.helperLongitude ? `${row.helperLatitude.toFixed(4)}, ${row.helperLongitude.toFixed(4)}` : t('common.na'),
      className: 'text-xs',
    },
    {
      header: t('bookings.fields.notes'), // Display notes
      accessor: 'notes',
      render: (row) => row.notes || t('common.na'),
      className: 'text-xs',
    },
  ];

  return (
    <Card title={t('bookings.activity.dispatchLog')}>
      <Table columns={columns} data={logs} />
    </Card>
  );
};

export default BookingDispatchLog;
