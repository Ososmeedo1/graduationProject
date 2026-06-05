import React from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../../context/ThemeContext';

/**
 * Card container component
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className='']
 * @param {string} [props.title]
 * @param {React.ReactNode} [props.actions]
 */
const Card = ({ children, className = '', title, actions, ...props }) => {
  const { motionEnabled } = useTheme();
  const motionClasses = motionEnabled ? 'hover:-translate-y-1 transition-all duration-300 ease-in-out' : '';

  return (
    <div
      className={`bg-surface shadow-[var(--app-shadow)] border border-stroke overflow-hidden glass-sheen card-3d ${motionClasses} ${className}`}
      style={{ borderRadius: 'var(--app-radius)' }}
      {...props}
    >
      {(title || actions) && (
        <div className="px-6 py-5 border-b border-stroke flex justify-between items-center bg-transparent backdrop-blur-sm">
          {title && <h3 className="text-lg font-bold text-ink tracking-tight">{title}</h3>}
          {actions && <div className="flex space-x-2 rtl:space-x-reverse">{actions}</div>}
        </div>
      )}
      <div className="p-6 relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.string,
  actions: PropTypes.node,
};

export default Card;
