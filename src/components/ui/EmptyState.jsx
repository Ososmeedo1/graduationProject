import React from 'react';
import PropTypes from 'prop-types';
import { Inbox } from 'lucide-react';
import Button from './Button';

/**
 * EmptyState component
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.description
 * @param {string} [props.actionLabel]
 * @param {function} [props.onAction]
 * @param {React.ReactNode} [props.icon]
 */
const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-surface-muted/70 rounded-lg border border-stroke border-dashed">
      <div className="w-12 h-12 bg-surface-inset rounded-full flex items-center justify-center mb-4 text-ink-muted">
        {icon || <Inbox size={24} />}
      </div>
      <h3 className="text-lg font-medium text-ink mb-1">{title}</h3>
      <p className="text-sm text-ink-muted max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

EmptyState.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  actionLabel: PropTypes.string,
  onAction: PropTypes.func,
  icon: PropTypes.node,
};

export default EmptyState;
