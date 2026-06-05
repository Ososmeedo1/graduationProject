import React from 'react';
import Badge from '../../ui/Badge';

const PaymentStatusBadge = ({ status }) => {
  const getVariant = (s) => {
    const lower = s?.toLowerCase() || '';
    if (lower === 'paid') return 'success';
    if (lower === 'refunded') return 'info';
    if (['awaitingpayment', 'paymentpending'].includes(lower)) return 'warning';
    if (lower === 'failed') return 'danger';
    return 'default';
  };

  return <Badge label={status} variant={getVariant(status)} />;
};

export default PaymentStatusBadge;
