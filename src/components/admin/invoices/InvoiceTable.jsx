import React from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Printer, XCircle } from 'lucide-react';
import Table from '../../ui/Table';
import Button from '../../ui/Button';
import InvoiceStatusBadge from './InvoiceStatusBadge';
import PaymentStatusBadge from './PaymentStatusBadge';
import { formatDate, formatCurrency } from '../../../utils/formatters';

const InvoiceTable = ({ data, isLoading, onView, onPrint, onVoid }) => {
  const { t } = useTranslation();

  const columns = [
    {
      header: t('invoices.fields.number'),
      accessor: 'index',
      className: 'font-mono text-xs font-bold',
      render: (_, index) => index + 1,
    },
    {
      header: t('invoices.fields.user'),
      accessor: 'userName',
    },
    {
      header: t('invoices.fields.helper'),
      accessor: 'helperName',
    },
    {
      header: t('invoices.fields.amount'),
      accessor: 'totalAmount',
      render: (row) => formatCurrency(row.totalAmount, row.currency),
    },
    {
      header: t('invoices.fields.status'),
      accessor: 'status',
      render: (row) => <InvoiceStatusBadge status={row.status} />,
    },
    {
      header: t('invoices.fields.paymentStatus'),
      accessor: 'paymentStatus',
      render: (row) => <PaymentStatusBadge status={row.paymentStatus} />,
    },
    {
      header: t('invoices.fields.issuedAt'),
      accessor: 'issuedAt',
      render: (row) => formatDate(row.issuedAt, 'medium'),
    },
    {
      header: t('common.actions'),
      accessor: 'id',
      className: 'text-right',
      render: (row) => (
        <div className="flex justify-end gap-1">
          {row.status?.toLowerCase() === 'issued' && (
            <Button variant="ghost" size="sm" onClick={() => onVoid(row)} title={t('invoices.actions.void')}>
              <XCircle size={16} className="text-red-500" />
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => onPrint(row)} title={t('invoices.actions.print')}>
            <Printer size={16} className="text-ink-muted" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onView(row)} title={t('common.view')}>
            <Eye size={16} className="text-ink-muted" />
          </Button>
        </div>
      ),
    },
  ];

  return <Table columns={columns} data={data} isLoading={isLoading} />;
};

export default InvoiceTable;
