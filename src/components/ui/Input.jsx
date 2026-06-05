import React from 'react';
import PropTypes from 'prop-types';

/**
 * Input component with label and error support
 * @param {Object} props
 * @param {string} props.label
 * @param {string} [props.error]
 * @param {string} [props.id]
 * @param {string} [props.type='text']
 * @param {string} [props.className='']
 * @param {React.ReactNode} [props.icon]
 */
const Input = ({
  label,
  error,
  id,
  type = 'text',
  className = '',
  icon,
  ref,
  ...props
}) => {
  const inputId = id || props.name;

  return (
    <div className={`w-full group ${className}`}>
      {label && (
        <label htmlFor={inputId} className={`block text-sm font-semibold mb-1.5 transition-colors duration-200 ${error ? 'text-red-500' : 'text-ink-muted group-focus-within:text-primary-600'}`}>
          {label}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`
            block w-full rounded-xl border bg-surface backdrop-blur-sm shadow-sm transition-all duration-300 ease-in-out sm:text-sm
            hover:border-primary-300 hover:shadow-md
            focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-surface focus:outline-none
            ${error ? 'border-red-400 text-red-900 placeholder-red-300 focus:ring-red-500/20 focus:border-red-500' : 'border-stroke text-ink placeholder:text-ink-muted'}
            ${icon ? 'pl-11 rtl:pl-4 rtl:pr-11' : 'px-4'}
            py-2.5
          `}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {icon && (
          <div className={`absolute inset-y-0 left-0 pl-3.5 rtl:left-auto rtl:right-0 rtl:pr-3.5 flex items-center pointer-events-none transition-colors duration-200 ${error ? 'text-red-400' : 'text-ink-muted group-focus-within:text-primary-500'}`}>
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-500 font-medium animate-fadeInUp flex items-center" id={`${inputId}-error`}>
          <svg className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1 inline" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
          {error}
        </p>
      )}
    </div>
  );
};

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  id: PropTypes.string,
  type: PropTypes.string,
  className: PropTypes.string,
  icon: PropTypes.node,
  name: PropTypes.string,
  ref: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.any })]),
};

export default Input;
