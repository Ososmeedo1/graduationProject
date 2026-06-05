import React from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../../ui/Card';
import InvoiceStatusBadge from './InvoiceStatusBadge'; // Assuming this component exists
import PaymentStatusBadge from './PaymentStatusBadge'; // Assuming this component exists
import { formatDate, formatCurrency } from '../../../utils/formatters';

const InvoiceDetails = ({ invoice }) => {
  const { t } = useTranslation();

  if (!invoice) return null;

  const fields = [
    { label: t('invoices.fields.user'), value: invoice.userName },
    { label: t('invoices.fields.amount'), value: formatCurrency(invoice.amount, invoice.currency) },
    { label: t('invoices.fields.status'), value: <InvoiceStatusBadge status={invoice.status} /> },
    { label: t('invoices.fields.paymentStatus'), value: <PaymentStatusBadge status={invoice.paymentStatus} /> },
    { label: t('invoices.fields.issueDate'), value: invoice.issuedAt ? formatDate(invoice.issuedAt, 'full') : t('common.na') },
    { label: t('invoices.fields.dueDate'), value: invoice.dueDate ? formatDate(invoice.dueDate, 'full') : t('common.na') },
  ];

  return (
    <Card title={t('invoices.title')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {fields.map((field, index) => (
          <div key={index} className="flex flex-col">
            <dt className="text-sm text-ink-muted">{field.label}</dt>
            <dd className={`mt-1 font-medium text-ink ${field.mono ? 'font-mono text-xs break-all' : ''}`}>
              {field.value || t('common.na')}
            </dd>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InvoiceDetails;
