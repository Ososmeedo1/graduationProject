import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

const DirectionalWrapper = ({ className = '', children }) => {
  const { i18n } = useTranslation();
  const dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

  return (
    <div dir={dir} className={className}>
      {children}
    </div>
  );
};

DirectionalWrapper.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export default DirectionalWrapper;