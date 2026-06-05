import React from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, DollarSign } from 'lucide-react';
import KPICard from '../../dashboard/KPICard';
import Card from '../../ui/Card';
import { formatCurrency } from '../../../utils/formatters';

const InvoiceStatsCards = ({ invoiceStats, currency }) => {
  const { t } = useTranslation();

  if (!invoiceStats) return null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KPICard
          title={t('invoices.stats.total', 'Total Invoices')}
          value={invoiceStats.totalInvoices || 0}
          icon={Receipt}
          color="info"
        />
        <KPICard
          title={t('invoices.stats.grandTotal', 'Grand Total')}
          value={formatCurrency(invoiceStats.grandTotal || 0, currency)}
          icon={DollarSign}
          color="primary"
        />
        <KPICard
          title={t('invoices.stats.grandCommission', 'Grand Commission')}
          value={formatCurrency(invoiceStats.grandCommission || 0, currency)}
          icon={DollarSign}
          color="warning"
        />
        <KPICard
          title={t('invoices.stats.grandHelperNet', 'Helper Net Total')}
          value={formatCurrency(invoiceStats.grandHelperNet || 0, currency)}
          icon={DollarSign}
          color="success"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {(invoiceStats.paidCount !== undefined || invoiceStats.paidTotal !== undefined) && (
          <Card title={t('invoices.stats.paidCount', 'Paid')}>
            <ul className="space-y-2">
              {invoiceStats.paidCount !== undefined && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-ink-muted">{t('invoices.stats.paidCount', 'Paid Count')}</span>
                  <span className="font-medium text-ink">{invoiceStats.paidCount}</span>
                </li>
              )}
              {invoiceStats.paidTotal !== undefined && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-ink-muted">{t('invoices.stats.paidTotal', 'Paid Total')}</span>
                  <span className="font-medium text-ink">{formatCurrency(invoiceStats.paidTotal, currency)}</span>
                </li>
              )}
            </ul>
          </Card>
        )}

        {(invoiceStats.refundedCount !== undefined || invoiceStats.refundedTotal !== undefined) && (
          <Card title={t('invoices.stats.refundedCount', 'Refunded')}>
            <ul className="space-y-2">
              {invoiceStats.refundedCount !== undefined && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-ink-muted">{t('invoices.stats.refundedCount', 'Refunded Count')}</span>
                  <span className="font-medium text-ink">{invoiceStats.refundedCount}</span>
                </li>
              )}
              {invoiceStats.refundedTotal !== undefined && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-ink-muted">{t('invoices.stats.refundedTotal', 'Refunded Total')}</span>
                  <span className="font-medium text-ink">{formatCurrency(invoiceStats.refundedTotal, currency)}</span>
                </li>
              )}
            </ul>
          </Card>
        )}

        {(invoiceStats.issued !== undefined || invoiceStats.voided !== undefined) && (
          <Card title={t('invoices.stats.issued', 'Invoice Status')}>
            <ul className="space-y-2">
              {invoiceStats.issued !== undefined && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-ink-muted">{t('invoices.stats.issued', 'Issued')}</span>
                  <span className="font-medium text-ink">{invoiceStats.issued}</span>
                </li>
              )}
              {invoiceStats.voided !== undefined && (
                <li className="flex justify-between items-center text-sm">
                  <span className="text-ink-muted">{t('invoices.stats.voided', 'Voided')}</span>
                  <span className="font-medium text-ink">{invoiceStats.voided}</span>
                </li>
              )}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InvoiceStatsCards;
