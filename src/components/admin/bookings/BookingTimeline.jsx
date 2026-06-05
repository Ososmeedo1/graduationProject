import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../ui/Card';
import { formatDate, formatTime, formatDateTime } from '../../../utils/formatters';

const BookingTimeline = ({ activities }) => {
  const { t } = useTranslation();

  if (!activities || activities.length === 0) {
    return (
      <Card title={t('bookings.activity.title')}>
        <p className="text-center py-8 text-ink-muted">{t('common.noData')}</p>
      </Card>
    );
  }

  return (
    <Card title={t('bookings.activity.title')}>
      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stroke before:to-transparent">
        {activities.map((activity, index) => (
          <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-stroke bg-surface group-[.is-active]:bg-primary-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
              <div className="w-2 h-2 rounded-full bg-current"></div>
            </div>
            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-stroke bg-surface shadow-sm">
              <div className="flex items-center justify-between space-x-2 mb-1">
                <div className="font-bold text-ink">{activity.eventType}</div>
                <time className="font-mono text-xs text-primary-600">{activity.createdAt ? formatTime(activity.createdAt, 'short') : t('common.na')}</time>
              </div>
              <div className="text-sm text-ink-muted">
                {activity.description}
              </div>
              <div className="mt-1 text-xs text-ink-muted flex flex-wrap gap-x-2">
                <span className="font-medium text-ink-muted">{t('common.actor')}: {activity.actorType}</span>
              </div>
              <div className="mt-1 text-xs text-ink-muted">
                {activity.createdAt ? formatDateTime(activity.createdAt, 'medium', 'short') : t('common.na')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default BookingTimeline;
