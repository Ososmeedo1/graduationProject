import React from 'react';
import Badge from '../../ui/Badge';

const BookingStatusBadge = ({ status }) => {
  const getVariant = (s) => {
    const statusLower = s?.toLowerCase() || '';
    if (['inprogress', 'active', 'started', 'acceptedbyhelper'].includes(statusLower)) return 'info';
    if (['completed', 'finished'].includes(statusLower)) return 'success';
    if (['cancelled', 'failed', 'rejected', 'cancelledbyuser'].includes(statusLower)) return 'danger';
    if (['pending', 'awaitingpayment', 'confirmed', 'pendinghelperresponse'].includes(statusLower)) return 'warning';
    return 'default';
  };

  return <Badge label={status} variant={getVariant(status)} />;
};

export default BookingStatusBadge;
