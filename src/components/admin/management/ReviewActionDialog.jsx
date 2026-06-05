import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Modal from '../../ui/Modal';

const SubmitButton = ({ label }) => {
  const { pending } = useFormStatus();
  const { t } = useTranslation();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 ${pending ? 'animate-pulse' : ''}`}
    >
      {pending ? t('common.loading', 'Loading...') : label}
    </button>
  );
};

const initialState = { error: '' };

const ReviewActionDialog = ({ isOpen, onClose, actionType, helperName, onConfirm }) => {
  const { t } = useTranslation();

  const needsReason = ['reject', 'suspend', 'ban', 'requestChanges', 'note'].includes(actionType);
  const reasonRequired = ['reject', 'suspend', 'ban', 'requestChanges', 'note'].includes(actionType);

  const [state, submitAction] = useActionState(async (_prevState, formData) => {
    const reason = String(formData.get('reason') || '').trim();
    const suspensionPeriod = String(formData.get('suspensionPeriod') || '').trim();

    if (reasonRequired && !reason) {
      return { error: t('helperReview.reasonRequired', 'Reason is required') };
    }

    await onConfirm({ reason, suspensionPeriod });
    return { error: '' };
  }, initialState);

  const actionLabel = {
    approve: t('helperReview.approve', 'Approve'),
    reject: t('helperReview.reject', 'Reject'),
    suspend: t('helperReview.suspend', 'Suspend'),
    ban: t('helperReview.ban', 'Ban'),
    unban: t('helperReview.unban', 'Unban'),
    activate: t('helperReview.activateHelper', 'Activate Helper'),
    requestChanges: t('helperReview.requestChanges', 'Request Changes'),
    markUnderReview: t('helperReview.markUnderReview', 'Mark Under Review'),
    note: t('helperReview.manualNote', 'Manual Note'),
  }[actionType] || t('common.confirm', 'Confirm');

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={actionLabel}>
      <form action={submitAction} className="space-y-4 text-start">
        <p className="text-sm text-ink-muted">
          {t('helperReview.confirmAction', 'Apply {{action}} to {{name}}?', {
            action: actionLabel,
            name: helperName || t('common.confirm', 'this helper'),
          })}
        </p>

        {needsReason && (
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="reason">
              {actionType === 'ban'
                ? t('helperReview.banReason', 'Ban reason')
                : actionType === 'note'
                  ? t('helperReview.manualNote', 'Manual Note')
                  : t('helperReview.reason', 'Reason')}
            </label>
            <textarea
              id="reason"
              name="reason"
              rows={3}
              placeholder={actionType === 'requestChanges' ? t('helperReview.changeRequestedByAdmin', 'Change requested by Admin') : ''}
              className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {actionType === 'suspend' && (
          <div>
            <label className="mb-1 block text-sm font-medium text-ink" htmlFor="suspensionPeriod">
              {t('helperReview.suspensionPeriod', 'Suspension period')}
            </label>
            <input
              id="suspensionPeriod"
              name="suspensionPeriod"
              placeholder={t('helperReview.suspensionPeriodPlaceholder', 'e.g., 7 days')}
              className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        )}

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <div className="flex items-center justify-end gap-2 border-t border-stroke pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-stroke px-4 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
          >
            {t('common.cancel', 'Cancel')}
          </button>
          <SubmitButton label={actionLabel} />
        </div>
      </form>
    </Modal>
  );
};

export default ReviewActionDialog;
