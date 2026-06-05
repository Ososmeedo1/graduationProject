import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';

const VoidInvoiceModal = ({ isOpen, onClose, onConfirm, invoice }) => {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [refundPayment, setRefundPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!reason.trim()) return;
    setLoading(true);
    try {
      const payloadRefundPayment = isPaid ? refundPayment : false;
      await onConfirm(reason, payloadRefundPayment);
      onClose();
      setReason('');
      setRefundPayment(false);
    } finally {
      setLoading(false);
    }
  };

  const isPaid = invoice?.paymentStatus === 'Paid';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('invoices.voidDialog.title')}>
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">
          {t('invoices.voidDialog.message', { number: invoice?.invoiceNumber })}
        </p>
        <div>
          <label className="block text-sm font-medium mb-1">{t('invoices.voidDialog.reason')}</label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('invoices.voidDialog.reasonPlaceholder')}
            className="w-full"
          />
        </div>
        {isPaid && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="refundPayment"
              checked={refundPayment}
              onChange={(e) => setRefundPayment(e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor="refundPayment" className="text-sm font-medium">
              {t('invoices.voidDialog.refundPayment')}
            </label>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="ghost" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="danger" onClick={handleConfirm} isLoading={loading} disabled={!reason.trim()}>
            {t('invoices.actions.void')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VoidInvoiceModal;
