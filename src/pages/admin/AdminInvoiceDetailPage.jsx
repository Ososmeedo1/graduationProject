import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Trash2, ShieldAlert, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import InvoiceStatusBadge from '../../components/admin/invoices/InvoiceStatusBadge';
import PaymentStatusBadge from '../../components/admin/invoices/PaymentStatusBadge';
import PaymentDetails from '../../components/admin/payments/PaymentDetails';
import { services } from '../../services';
import { formatDate, formatCurrency } from '../../utils/formatters';
import FileViewerModal from '../../components/ui/FileViewerModal';
import VoidInvoiceModal from '../../components/admin/invoices/VoidInvoiceModal';

const AdminInvoiceDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState(null);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [viewInvoiceUrl, setViewInvoiceUrl] = useState(null);
  const [voidModal, setVoidModal] = useState({ isOpen: false });

  const fetchInvoice = useCallback(async () => {
    try {
      setLoading(true);
      const data = await services.invoices.getInvoiceById(id);
      setInvoice(data);
      const paymentId = data?.paymentId || data?.payment?.id;
      if (paymentId) {
        setPaymentLoading(true);
        try {
          const paymentData = await services.payments.getPaymentById(paymentId);
          setPayment(paymentData);
        } catch {
          toast.error(t('payments.messages.fetchFailed'));
          setPayment(null);
        } finally {
          setPaymentLoading(false);
        }
      }
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed'));
      navigate('/admin/invoices');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, t]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handlePrint = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setViewInvoiceUrl(services.invoices.getInvoiceViewUrl(id));
  };

  const handleVoid = () => {
    setVoidModal({ isOpen: true });
  };

  const executeVoid = async (reason, refundPayment) => {
    try {
      await services.invoices.voidInvoice(id, reason, refundPayment);
      toast.success(t('common.updateSuccess'));
      fetchInvoice();
    } catch (error) {
      console.log('Void Invoice Error:', error);
      toast.error(error?.detail || error?.message || t('errors.updateFailed'));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <DirectionalWrapper className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/admin/invoices')}>
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-ink">{t('invoices.detailsTitle')}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint} icon={Printer}>
            {t('invoices.actions.print')}
          </Button>
          {invoice.status?.toLowerCase() !== 'voided' && (
            <Button variant="danger" onClick={handleVoid} icon={Trash2}>
              {t('invoices.actions.void')}
            </Button>
          )}
        </div>
      </div>

      {invoice.status?.toLowerCase() === 'voided' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <ShieldAlert className="text-red-600 shrink-0" size={20} />
          <div>
            <p className="font-bold text-red-800">{t('invoices.status.voided')}</p>
            <p className="text-sm text-red-700 mt-1">
              <span className="font-medium">{t('invoices.fields.voidReason')}:</span> {invoice.voidReason}
            </p>
            <p className="text-xs text-red-600 mt-1">
              {formatDate(invoice.voidedAt, 'full')}
            </p>
          </div>
        </div>
      )}

      <FileViewerModal
        isOpen={!!viewInvoiceUrl}
        onClose={() => setViewInvoiceUrl(null)}
        url={viewInvoiceUrl}
        title={t('invoices.actions.view')}
      />

      <VoidInvoiceModal
        isOpen={voidModal.isOpen}
        onClose={() => setVoidModal({ isOpen: false })}
        onConfirm={executeVoid}
        invoice={invoice}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title={t('common.details')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm text-ink-muted">{t('invoices.fields.status')}</dt>
                <dd className="mt-1"><InvoiceStatusBadge status={invoice.status} /></dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">{t('invoices.fields.paymentStatus')}</dt>
                <dd className="mt-1"><PaymentStatusBadge status={invoice.paymentStatus} /></dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">{t('invoices.fields.issuedAt')}</dt>
                <dd className="mt-1 font-medium">{formatDate(invoice.issuedAt, 'full')}</dd>
              </div>
              <div>
                <dt className="text-sm text-ink-muted">{t('invoices.fields.method')}</dt>
                <dd className="mt-1 font-medium">{invoice.paymentMethod || t('common.na')}</dd>
              </div>
            </div>
          </Card>

          <Card title={t('bookings.financials.title')}>
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-stroke">
                <span className="text-ink-muted">{t('bookings.financials.basePrice')}</span>
                <span>{formatCurrency(invoice.basePrice, invoice.currency)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-stroke">
                <span className="text-ink-muted">{t('bookings.financials.distancePrice')}</span>
                <span>{formatCurrency(invoice.distanceCost, invoice.currency)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-stroke">
                <span className="text-ink-muted">{t('bookings.financials.durationPrice')}</span>
                <span>{formatCurrency(invoice.durationCost, invoice.currency)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-stroke">
                <span className="text-ink-muted">{t('bookings.financials.surcharge')}</span>
                <span>{formatCurrency(invoice.instantSurchargeAmount, invoice.currency)}</span>
              </div>
              <div className="flex justify-between pt-4 text-lg font-bold">
                <span>{t('bookings.financials.total')}</span>
                <span className="text-primary-600">{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
              </div>
            </div>
          </Card>

          {paymentLoading ? (
            <Card title={t('payments.title')}>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </div>
            </Card>
          ) : payment ? (
            <PaymentDetails payment={payment} onUpdate={fetchInvoice} />
          ) : (
            <Card title={t('payments.title')}>
              <EmptyState
                icon={<AlertTriangle size={24} />}
                title={t('common.noData')}
                description={t('payments.messages.notAvailable')}
              />
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title={t('invoices.fields.user')}>
            <div className="font-bold">{invoice.userName}</div>
          </Card>
          <Card title={t('invoices.fields.helper')}>
            <div className="font-bold">{invoice.helperName}</div>
          </Card>
          <Card title={t('trips.details')}>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-ink-muted">{t('bookings.fields.destination')}</span>
                <span className="font-medium">{invoice.destinationCity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">{t('bookings.fields.duration')}</span>
                <span className="font-medium">{invoice.durationInMinutes} min</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DirectionalWrapper>
  );
};

export default AdminInvoiceDetailPage;
