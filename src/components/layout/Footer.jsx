import React from 'react';
import { useTranslation } from 'react-i18next';
import { APP_CONSTANTS } from '../../config/constants';

const Footer = () => {
  const { t } = useTranslation();
  const brand = t('app.title', APP_CONSTANTS.APP_TITLE || 'رفيق');

  return (
    <footer className="bg-surface border-t border-stroke mt-auto px-6 md:ml-64">
      <div className="flex flex-col gap-3 py-4 md:flex-row md:items-center md:justify-between text-sm">
        <div className="flex items-center gap-2 text-ink-muted">
          <span className="brand-mark font-semibold text-ink">{brand}</span>
          <span className="hidden sm:inline">•</span>
          <span>&copy; {new Date().getFullYear()} {t('footer.rights', 'All rights reserved.')}</span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-ink-muted">
          <span className="rounded-full border border-stroke px-2 py-0.5 text-xs uppercase tracking-wide">
            {t('footer.version', 'v1.0.0')}
          </span>
          <span className="h-1 w-1 rounded-full bg-ink-muted/50" />
          <span className="text-xs uppercase tracking-wide">{t('footer.support', 'Support')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
