import React from 'react';
import Badge from '../../ui/Badge';

const toVariant = (status) => {
  const value = String(status || '').toLowerCase();
  if (value === 'active') return 'success';
  if (value === 'suspended') return 'warning';
  if (value === 'banned') return 'danger';
  if (value === 'rejected') return 'danger';
  if (value === 'underreview') return 'info';
  if (value === 'changesrequested') return 'warning';
  return 'info';
};

const HelperStatusBadge = ({ status }) => {
  return <Badge label={status || 'Pending'} variant={toVariant(status)} />;
};

export default HelperStatusBadge;
