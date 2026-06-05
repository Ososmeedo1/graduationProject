import React from 'react';
import PropTypes from 'prop-types';

/**
 * Select component
 * @param {Object} props
 * @param {string} [props.label]
 * @param {string} [props.error]
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} [props.className='']
 */
const Select = ({
  label,
  error,
  options = [],
  className = '',
  id,
  ref,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-ink-muted mb-1">
          {label}
        </label>
      )}
      <select
        id={inputId}
        ref={ref}
        className={`
          block w-full rounded-lg border bg-surface shadow-sm transition-colors focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm py-2 px-3
          ${error ? 'border-red-300 text-red-900 dark:border-red-700 dark:text-red-200' : 'border-stroke text-ink'}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" id={`${inputId}-error`}>
          {error}
        </p>
      )}
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
  })).isRequired,
  className: PropTypes.string,
  id: PropTypes.string,
  name: PropTypes.string,
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default Select;
