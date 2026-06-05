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
      disabled={pending}
      className={`inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60 ${pending ? 'animate-pulse' : ''}`}
    >
      {pending ? t('common.loading', 'Loading...') : t('common.search', 'Search')}
    </button>
  );
};

const ReportFilterForm = ({ defaultFilters, onApply }) => {
  const { t } = useTranslation();

  const [, submitAction] = useActionState(async (_previousState, formData) => {
    const nextFilters = {
      startDate: String(formData.get('startDate') || ''),
      endDate: String(formData.get('endDate') || ''),
      category: 'helpers',
      status: String(formData.get('status') || 'all'),
    };

    onApply(nextFilters);
    return { submittedAt: Date.now() };
  }, initialFormState);

  return (
    <form action={submitAction} className="rounded-xl border border-stroke bg-surface p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-ink">
            {t('reports.startDate', 'Start Date')}
          </label>
          <input
            id="startDate"
            type="date"
            name="startDate"
            defaultValue={defaultFilters.startDate}
            className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label htmlFor="endDate" className="mb-1 block text-sm font-medium text-ink">
            {t('reports.endDate', 'End Date')}
          </label>
          <input
            id="endDate"
            type="date"
            name="endDate"
            defaultValue={defaultFilters.endDate}
            className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <input type="hidden" name="category" value="helpers" />

        <div>
          <label htmlFor="status" className="mb-1 block text-sm font-medium text-ink">
            {t('common.status', 'Status')}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={defaultFilters.status}
            className="w-full rounded-lg border border-stroke bg-surface px-3 py-2 text-sm text-ink focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">{t('common.all', 'All')}</option>
            <option value="unresolved">{t('reports.unresolved', 'Unresolved')}</option>
            <option value="resolved">{t('reports.resolved', 'Resolved')}</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <SubmitButton />
      </div>
    </form>
  );
};

export default ReportFilterForm;
