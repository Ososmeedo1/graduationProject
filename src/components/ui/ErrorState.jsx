import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, RefreshCw } from 'lucide-react';
import Button from './Button';

/**
 * ErrorState component
 * @param {Object} props
 * @param {string} [props.title='Something went wrong']
 * @param {string} [props.message]
 * @param {function} [props.onRetry]
 */
const ErrorState = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Retry',
  retryingLabel = 'Retrying...',
  icon,
  className = '',
}) => {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || retrying) return;

    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg border border-red-100 ${className}`}>
      {icon || <AlertCircle className="w-12 h-12 text-red-400 mb-4" />}
      <h3 className="text-lg font-medium text-red-900 mb-1">{title}</h3>
      {message && <p className="text-sm text-red-600 max-w-sm mb-4">{message}</p>}
      {onRetry && (
        <Button onClick={handleRetry} variant="danger" size="sm" disabled={retrying}>
          <RefreshCw className={`w-4 h-4 mr-2 ${retrying ? 'animate-spin' : ''}`} />
          {retrying ? retryingLabel : retryLabel}
        </Button>
      )}
    </div>
  );
};

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  retryLabel: PropTypes.string,
  retryingLabel: PropTypes.string,
  icon: PropTypes.node,
  className: PropTypes.string,
};

export default ErrorState;
