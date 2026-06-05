import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, SearchX, ShieldAlert, ArrowLeft } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import ErrorState from '../ui/ErrorState';
import Button from '../ui/Button';

const AdminStateWrapper = ({
  variant,
  title,
  message,
  onRetry,
  compact = false,
  showBackButton = false,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (variant === 'error') {
    return (
      <ErrorState
        title={title || t('errors.fetchFailed', 'Failed to fetch data')}
        message={message}
        onRetry={onRetry}
        retryLabel={t('states.tryAgain', 'Try again')}
        retryingLabel={t('common.loading', 'Loading...')}
        icon={<AlertTriangle className="h-12 w-12 text-red-400" />}
        className={compact ? 'py-6' : ''}
      />
    );
  }

  if (variant === 'forbidden') {
    return (
      <div className={`rounded-xl border border-red-200/70 bg-red-500/10 ${compact ? 'p-4' : 'p-8'}`}>
        <EmptyState
          title={title || t('states.forbiddenTitle', 'Access Denied')}
          description={
            message ||
            t(
              'states.forbiddenDescription',
              'You do not have permission to view this. Contact Super-Admin if this is unexpected.'
            )
          }
          icon={<ShieldAlert size={44} className="text-red-500" />}
        />

        {showBackButton && (
          <div className="mt-3 flex justify-center">
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />
              {t('states.backToDashboard', 'Back to Dashboard')}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-stroke bg-surface ${compact ? 'p-4' : 'p-8'}`}>
      <EmptyState
        title={title || t('states.noResultsTitle', 'No results found')}
        description={message || t('common.noData', 'No data available')}
        icon={<SearchX size={40} className="text-ink-muted" />}
      />
    </div>
  );
};

export default AdminStateWrapper;
