import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../ui/Card';
import Table from '../../ui/Table';
import { formatDate } from '../../../utils/formatters';

const BookingTrackingDetails = ({ trackingData }) => {
  const { t } = useTranslation();

  const columns = [
    {
      header: t('common.id'),
      accessor: 'id',
      className: 'font-mono text-xs',
    },
    {
      header: t('bookings.fields.bookingId'),
      accessor: 'bookingId',
      className: 'font-mono text-xs',
    },
    {
      header: t('bookings.fields.helperId'),
      accessor: 'helperId',
      className: 'font-mono text-xs',
    },
    {
      header: t('bookings.fields.latitude'),
      accessor: 'latitude',
      render: (row) => row.latitude.toFixed(4),
    },
    {
      header: t('bookings.fields.longitude'),
      accessor: 'longitude',
      render: (row) => row.longitude.toFixed(4),
    },
    {
      header: t('bookings.fields.heading'),
      accessor: 'heading',
      render: (row) => `${row.heading}°`,
    },
    {
      header: t('bookings.fields.speed'),
      accessor: 'speedKmh',
      render: (row) => `${row.speedKmh.toFixed(1)} km/h`,
    },
    {
      header: t('bookings.fields.accuracy'),
      accessor: 'accuracyMeters',
      render: (row) => `${row.accuracyMeters} m`,
    },
    {
      header: t('bookings.fields.phase'),
      accessor: 'phase',
    },
    {
      header: t('bookings.fields.timestamp'),
      accessor: 'timestamp',
      render: (row) => formatDate(row.timestamp, 'full'),
    },
    {
      header: t('bookings.fields.createdAt'),
      accessor: 'createdAt',
      render: (row) => formatDate(row.createdAt, 'full'),
    },
  ];

  if (!trackingData || trackingData.length === 0) {
    return (
      <Card title={t('bookings.trackingDetailsTitle')}>
        <p className="text-center py-8 text-ink-muted">{t('common.noData')}</p>
      </Card>
    );
  }

  return (
    <Card title={t('bookings.trackingDetailsTitle')}>
      <Table columns={columns} data={trackingData} />
    </Card>
  );
};

export default BookingTrackingDetails;
