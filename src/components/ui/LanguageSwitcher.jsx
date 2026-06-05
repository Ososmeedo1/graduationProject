import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    // document dir update is often handled by a useEffect in App or main layout, 
    // but good to ensure consistency
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center justify-center p-2 rounded-lg text-ink-muted hover:bg-surface-inset hover:text-ink transition-colors focus:outline-none"
      aria-label="Toggle Language"
    >
      <Globe className="w-5 h-5 mr-2 rtl:mr-0 rtl:ml-2" />
      <span className="text-sm font-medium uppercase">{i18n.language}</span>
    </button>
  );
};

export default LanguageSwitcher;
