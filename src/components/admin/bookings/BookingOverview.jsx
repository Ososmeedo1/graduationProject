import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../ui/Card';
import BookingStatusBadge from './BookingStatusBadge';
import BookingMapView from './BookingMapView';
import { formatDate } from '../../../utils/formatters';

const BookingOverview = ({ booking, latestTrackingData }) => {
  const { t } = useTranslation();

  const details = [
    { label: t('bookings.fields.status'), value: <BookingStatusBadge status={booking.status} /> },
    { label: t('bookings.fields.type'), value: booking.bookingType },
    { label: t('bookings.fields.requestedLanguage'), value: booking.requestedLanguage || t('common.na') },
    { label: t('bookings.fields.requiresCar'), value: booking.requiresCar ? t('common.yes') : t('common.no') },
    { label: t('bookings.fields.travelersCount'), value: booking.travelersCount || t('common.na') },
    { label: t('bookings.fields.notes'), value: booking.notes || t('common.na') },

    { label: t('bookings.fields.pickupLocationName'), value: booking.pickupLocationName || t('common.na') },
    { label: t('bookings.fields.pickupAddress'), value: booking.pickupAddress || t('common.na') },

    { label: t('bookings.fields.destinationName'), value: booking.destinationName || booking.destinationCity || booking.city || t('common.na') },

    { label: t('bookings.fields.scheduledAt'), value: formatDate(booking.requestedDate, 'full') },
    { label: t('bookings.fields.startTime'), value: booking.startTime || t('common.na') },
    { label: t('bookings.fields.duration'), value: `${booking.durationInMinutes} ${t('common.minutes', 'min')}` },
    { label: t('bookings.fields.tripDistance'), value: booking.tripDistanceKm ? `${booking.tripDistanceKm} ${t('common.km')}` : t('common.na') },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title={t('common.details')}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
          {details.map((item, index) => (
            <div key={index} className="flex flex-col">
              <dt className="text-sm text-ink-muted">{item.label}</dt>
              <dd className={`mt-1 font-medium text-ink ${item.mono ? 'font-mono text-xs' : ''}`}>
                {item.value || t('common.na')}
              </dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="space-y-6">
        <Card title={t('bookings.fields.user')}>
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl mr-4 rtl:ml-4">
              {booking.user?.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="font-bold text-ink">{booking.user?.fullName}</p>
              <p className="text-sm text-ink-muted">{booking.user?.email}</p>
              <p className="text-sm text-ink-muted">{booking.user?.phoneNumber}</p>
            </div>
          </div>
        </Card>

        {booking.helper && (
          <Card title={t('bookings.fields.helper')}>
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl mr-4 rtl:ml-4">
                {booking.helper?.fullName?.charAt(0) || 'H'}
              </div>
              <div>
                <p className="font-bold text-ink">{booking.helper?.fullName}</p>
                <p className="text-sm text-ink-muted">{booking.helper?.email}</p>
                <p className="text-sm text-ink-muted">{booking.helper?.phoneNumber}</p>
              </div>
            </div>
          </Card>
        )}

        {latestTrackingData && (
          <BookingMapView
            latestPosition={latestTrackingData}
            showOnlyCurrentLocation={true}
          />
        )}
      </div>
    </div>
  );
};

export default BookingOverview;
