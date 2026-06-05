import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import DirectionalWrapper from '../../components/ui/DirectionalWrapper';
import Button from '../../components/ui/Button';
import InvoiceTable from '../../components/admin/invoices/InvoiceTable';
import InvoiceFilterForm from '../../components/admin/invoices/InvoiceFilterForm';
import InvoiceStatsCards from '../../components/admin/invoices/InvoiceStatsCards';
import VoidInvoiceModal from '../../components/admin/invoices/VoidInvoiceModal';
import FileViewerModal from '../../components/ui/FileViewerModal';
import { services } from '../../services';

const AdminInvoicesPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    paymentStatus: 'all',
    status: 'all',
    from: '',
    to: '',
  });
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, limit: 10 });
  const [voidModal, setVoidModal] = useState({ isOpen: false, invoice: null });
  const [viewInvoiceUrl, setViewInvoiceUrl] = useState(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        Search: filters.search,
        PaymentStatus: filters.paymentStatus !== 'all' ? filters.paymentStatus : undefined,
        Status: filters.status !== 'all' ? filters.status : undefined,
        From: filters.from || undefined,
        To: filters.to || undefined,
        Page: pagination.page,
        PageSize: pagination.limit,
      };

      const [invoicesResult, statsResult] = await Promise.all([
        services.invoices.getInvoices(params),
        services.invoices.getInvoiceStats(),
      ]);

      setData(invoicesResult.items || []);
      setStats(statsResult);
      setPagination((prev) => ({
        ...prev,
        totalPages: invoicesResult.totalPages || 1,
      }));
    } catch (error) {
      toast.error(error?.detail || error?.message || t('errors.fetchFailed'));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit, t]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleView = (invoice) => {
    navigate(`/admin/invoices/${invoice.id}`);
  };

  const handlePrint = (invoice) => {
    setViewInvoiceUrl(services.invoices.getInvoiceViewUrl(invoice.id));
  };

  const handleVoid = (invoice) => {
    setVoidModal({ isOpen: true, invoice });
  };

  const confirmVoid = async (reason, refundPayment) => {
    try {
      await services.invoices.voidInvoice(voidModal.invoice.id, reason, refundPayment);
      toast.success(t('invoices.voidSuccess', 'Invoice voided successfully'));
      fetchInvoices();
    } catch (error) {
      console.log('Void Invoice Error:', error);
      toast.error(error?.detail || error?.message || t('errors.updateFailed'));
    }
  };

  return (
    <DirectionalWrapper className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink">{t('invoices.title')}</h1>
          <p className="text-ink-muted">{t('invoices.subtitle')}</p>
        </div>
      </div>

      <InvoiceStatsCards invoiceStats={stats} currency={stats?.currency} />

      <InvoiceFilterForm onFilter={handleFilterChange} initialFilters={filters} />

      <div className="bg-surface shadow-sm rounded-lg border border-stroke overflow-hidden">
        <InvoiceTable 
          data={data} 
          isLoading={loading} 
          onView={handleView} 
          onPrint={handlePrint}
          onVoid={handleVoid}
        />
      </div>

      <div className="flex justify-between items-center bg-surface p-4 rounded-lg border border-stroke">
        <Button
          variant="outline"
          disabled={pagination.page <= 1}
          onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
        >
          {t('common.previous')}
        </Button>
        <span className="text-sm text-ink-muted">
          {t('common.pageOf', { page: pagination.page, total: pagination.totalPages })}
        </span>
        <Button
          variant="outline"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
        >
          {t('common.next')}
        </Button>
      </div>

      <VoidInvoiceModal
        isOpen={voidModal.isOpen}
        onClose={() => setVoidModal({ isOpen: false, invoice: null })}
        onConfirm={confirmVoid}
        invoice={voidModal.invoice}
      />
      
      <FileViewerModal
        isOpen={!!viewInvoiceUrl}
        onClose={() => setViewInvoiceUrl(null)}
        url={viewInvoiceUrl}
        title={t('invoices.actions.view')}
      />
    </DirectionalWrapper>
  );
};

export default AdminInvoicesPage;
