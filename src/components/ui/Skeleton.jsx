import React from 'react';
import PropTypes from 'prop-types';

/**
 * Skeleton loader component
 * @param {Object} props
 * @param {string} [props.className='']
 */
const Skeleton = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-surface-inset rounded ${className}`}
      {...props}
    />
  );
};

Skeleton.propTypes = {
  className: PropTypes.string,
};

export default Skeleton;
