import React from 'react';
import { Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';

/**
 * Button component with variants and loading state
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'primary'|'secondary'|'danger'|'ghost'|'outline'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {boolean} [props.isLoading=false]
 * @param {boolean} [props.loading=false]
 * @param {boolean} [props.disabled=false]
 * @param {'button'|'submit'|'reset'} [props.type='button']
 * @param {string} [props.className='']
 * @returns {JSX.Element}
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const resolvedLoading = isLoading || loading;
  const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm hover:shadow';

  const variants = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white hover:from-primary-700 hover:to-primary-600 hover:shadow-glow-primary focus:ring-primary-500 border border-transparent',
    secondary: 'bg-secondary-50 text-secondary-900 hover:bg-secondary-100 focus:ring-secondary-500 border border-secondary-200/50',
    danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 hover:shadow-lg hover:shadow-red-500/30 focus:ring-red-500 border border-transparent',
    ghost: 'bg-transparent text-ink-muted hover:bg-surface-inset focus:ring-gray-500 shadow-none hover:shadow-none',
    outline: 'border border-stroke bg-surface text-ink hover:bg-surface-muted focus:ring-primary-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || resolvedLoading}
      {...props}
    >
      {resolvedLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin rtl:mr-0 rtl:ml-2" />}
      {children}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'ghost', 'outline']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  isLoading: PropTypes.bool,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default Button;
