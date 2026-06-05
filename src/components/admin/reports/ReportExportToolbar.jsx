import React from 'react';
import { useTranslation } from 'react-i18next';

const ReportExportToolbar = ({ onExportCsv, onPrint }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onExportCsv}
        className="rounded-md border border-stroke bg-surface px-3 py-2 text-sm font-medium text-ink hover:bg-surface-muted"
      >
        {t('reports.exportCsv', 'Export CSV')}
      </button>
      <button
        type="button"
        onClick={onPrint}
        className="rounded-md border border-primary-400/40 bg-primary-500/10 px-3 py-2 text-sm font-medium text-primary-700 hover:bg-primary-500/20"
      >
        {t('reports.printPdf', 'Print PDF')}
      </button>
    </div>
  );
};

export default ReportExportToolbar;
