import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../ui/Card';
import { formatCurrency } from '../../../utils/formatters';

const BookingFinancials = ({ booking }) => {
  const { t } = useTranslation();
  const pricing = booking.priceBreakdown || {};

  const items = [
    { label: t('bookings.financials.basePrice'), value: pricing.basePrice },
    { label: t('bookings.financials.distancePrice'), value: pricing.distanceCost },
    { label: t('bookings.financials.durationPrice'), value: pricing.durationCost },
    { label: t('bookings.financials.surcharge'), value: pricing.instantSurchargeAmount },
    { label: t('bookings.financials.commission'), value: pricing.rafiqCommissionAmount, negative: true },
    { label: t('bookings.financials.helperPayout'), value: pricing.helperNetAmount, isPayout: true },
  ];

  return (
    <Card title={t('bookings.financials.title')}>
      <div className="space-y-4 max-w-2xl mx-auto">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between items-center py-2 border-b border-stroke last:border-0">
            <span className="text-ink-muted">{item.label}</span>
            <span className={`font-medium ${item.negative ? 'text-red-600' : item.isPayout ? 'text-green-600' : 'text-ink'}`}>
              {item.negative ? '-' : ''}{formatCurrency(item.value || 0, pricing.currency)}
            </span>
          </div>
        ))}
        <div className="flex justify-between items-center py-4 mt-2 border-t-2 border-stroke">
          <span className="text-lg font-bold text-ink">{t('bookings.financials.total')}</span>
          <span className="text-2xl font-black text-primary-600">
            {formatCurrency(pricing.totalPrice || pricing.subtotal || booking.finalPrice || booking.estimatedPrice, pricing.currency)}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default BookingFinancials;
