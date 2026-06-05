import React from 'react';
import { useTranslation } from 'react-i18next';
import Badge from '../../ui/Badge';

const InvoiceStatusBadge = ({ status }) => {
  const { t } = useTranslation();
  
  const getVariant = (s) => {
    const lower = s?.toLowerCase() || '';
    if (lower === 'issued') return 'success';
    if (lower === 'voided') return 'danger';
    return 'default';
  };

  const getLabel = (s) => {
    const lower = s?.toLowerCase() || '';
    if (lower === 'issued') return t('invoices.status.issued');
    if (lower === 'voided') return t('invoices.status.voided');
    return s;
  };

  return <Badge label={getLabel(status)} variant={getVariant(status)} />;
};

export default InvoiceStatusBadge;
