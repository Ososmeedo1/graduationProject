import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDate } from '../../../utils/formatters';

const HelperNotesTimeline = ({ notes = [], onAddNote, canAddNote = false }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      {canAddNote && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onAddNote}
            className="rounded-md border border-primary-300/50 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-500/10"
          >
            {t('helperReview.addNote', 'Add Note')}
          </button>
        </div>
      )}

      {notes.length === 0 ? (
        <p className="text-sm text-ink-muted">{t('common.noData', 'No data available')}</p>
      ) : (
        <ol className="relative border-s border-stroke ps-4">
          {notes.map((item) => (
            <li key={item.id} className="mb-4 ms-2">
              <span className="absolute -start-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-primary-500" />
              <p className="text-xs text-ink-muted">
                {item.createdBy ? `${item.createdBy} - ` : ''}
                {item.createdAt ? formatDate(item.createdAt, 'medium') : ''}
              </p>
              <p className="text-sm text-ink">{item.note}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

export default HelperNotesTimeline;
