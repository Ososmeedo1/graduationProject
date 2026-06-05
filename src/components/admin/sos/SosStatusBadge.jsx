import React from 'react';
import Badge from '../../ui/Badge';

const SosStatusBadge = ({ status }) => {
  const getVariant = (s) => {
    const lower = s?.toLowerCase() || '';
    if (lower === 'active') return 'danger';
    if (lower === 'handled') return 'success';
    if (lower === 'falsealarm') return 'warning';
    return 'default';
  };

  return <Badge label={status} variant={getVariant(status)} />;
};

export default SosStatusBadge;
