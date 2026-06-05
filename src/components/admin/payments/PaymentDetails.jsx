import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshCcw, ShieldAlert, CreditCard, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import EmptyState from '../../ui/EmptyState';
import PaymentStatusBadge from '../invoices/PaymentStatusBadge';
import { formatDate, formatCurrency } from '../../../utils/formatters';
import { services } from '../../../services';
import useAlert from '../../../hooks/useAlert';

const PaymentDetails = ({ payment, onUpdate }) => {
  const { t } = useTranslation();
  const { prompt } = useAlert();
  const [loading, setLoading] = useState(false);

  // Safety guard: if payment data is missing, show empty state
  if (!payment) {
    return (
      <Card title={t('payments.title')}>
        <EmptyState
          icon={<AlertTriangle size={24} />}
          title={t('common.noData')}
          description={t('payments.messages.notAvailable')}
        />
      </Card>
    );
  }

  const handleRefund = async () => {
    const reason = await prompt({
      title: t('payments.refundDialog.title'),
      message: t('payments.refundDialog.message'),
      placeholder: t('payments.refundDialog.reasonPlaceholder'),
      confirmText: t('payments.actions.refund'),
      type: 'danger',
    });

    if (reason === null) return;
    if (!reason.trim()) {
      toast.error(t('validation.required'));
      return;
    }

    try {
      setLoading(true);
      await services.payments.refundPayment(payment.id, reason);
      toast.success(t('payments.messages.refundSuccess'));
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.updateFailed'));
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { label: t('payments.fields.id'), value: payment.id, mono: true },
    { label: t('payments.fields.status'), value: <PaymentStatusBadge status={payment.status} /> },
    { label: t('payments.fields.method'), value: payment.method },
    { label: t('payments.fields.amount'), value: formatCurrency(payment.amount, payment.currency) },
    { label: t('payments.fields.gateway'), value: payment.gatewayProvider },
    { label: t('payments.fields.gatewayRef'), value: payment.gatewayRef, mono: true },
    { label: t('payments.fields.initiatedAt'), value: formatDate(payment.initiatedAt, 'full') },
    { label: t('payments.fields.completedAt'), value: formatDate(payment.completedAt, 'full') },
  ];

  const canRefund = payment.status?.toLowerCase() === 'paid';

  return (
    <div className="space-y-6">
      <Card 
        title={t('payments.title')}
        actions={
          canRefund && (
            <Button 
              variant="danger" 
              size="sm" 
              onClick={handleRefund} 
              loading={loading}
              icon={RefreshCcw}
            >
              {t('payments.actions.refund')}
            </Button>
          )
        }
      >
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

        {payment.status?.toLowerCase() === 'failed' && payment.failureReason && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <ShieldAlert className="text-red-600 shrink-0" size={20} />
            <div>
              <p className="font-bold text-red-800">{t('payments.fields.failureReason')}</p>
              <p className="text-sm text-red-700 mt-1">{payment.failureReason}</p>
            </div>
          </div>
        )}

        {payment.status?.toLowerCase() === 'refunded' && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
            <CreditCard className="text-blue-600 shrink-0" size={20} />
            <div>
              <p className="font-bold text-blue-800">{t('invoices.status.refunded', 'Refunded')}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                <div>
                  <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">{t('payments.fields.refundedAmount')}</p>
                  <p className="text-sm font-bold text-blue-900">{formatCurrency(payment.refundedAmount, payment.currency)}</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">{t('payments.fields.refundedAt')}</p>
                  <p className="text-sm font-bold text-blue-900">{formatDate(payment.refundedAt, 'full')}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-blue-600 uppercase font-bold tracking-wider">{t('payments.fields.refundReason')}</p>
                  <p className="text-sm text-blue-800">{payment.refundReason}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PaymentDetails;
