import React, { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTranslation } from 'react-i18next';

const initialFormState = {
  submittedAt: 0,
};

const SubmitButton = () => {
  const { pending } = useFormStatus();
  const { t } = useTranslation();

  return (
    <button
      type="submit"
      className={`inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 ${pending ? 'animate-pulse' : ''}`}
      disabled={pending}
    >
      {pending ? t('common.loading', 'Loading...') : t('common.search', 'Search')}
    </button>
  );
};

const AuditFilterForm = ({ defaultFilters, onApply }) => {
  const { t } = useTranslation();

  const [, submitAction] = useActionState(async (_previousState, formData) => {
    const nextFilters = {
      Action: formData.get('Action') || '',
      AdminId: formData.get('AdminId') || '',
      TargetType: formData.get('TargetType') || '',
      PageSize: Number(formData.get('PageSize') || 10),
      Page: 1,
    };

    onApply(nextFilters);
    return { submittedAt: Date.now() };
  }, initialFormState);

  return (
    <form action={submitAction} className="rounded-xl border border-stroke bg-surface p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        <input
          type="text"
          name="Action"
          placeholder={t('audit.filters.action', 'Action')}
          defaultValue={defaultFilters.Action}
          className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="text"
          name="AdminId"
          placeholder={t('audit.filters.adminId', 'Admin ID')}
          defaultValue={defaultFilters.AdminId}
          className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          type="text"
          name="TargetType"
          placeholder={t('audit.filters.targetType', 'Target Type')}
          defaultValue={defaultFilters.TargetType}
          className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <select
          name="PageSize"
          defaultValue={String(defaultFilters.PageSize)}
          className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>
      <div className="mt-4 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
};

export default AuditFilterForm;
