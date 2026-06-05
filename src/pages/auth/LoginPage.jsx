import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate } from 'react-router-dom';
import LoginForm from '../../components/auth/LoginForm';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';
import { APP_CONSTANTS } from '../../config/constants';
import useAuth from '../../hooks/useAuth';

const LoginPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, isInitialized } = useAuth();

  // Redirect to dashboard if already authenticated
  if (isInitialized && isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4 rtl:left-4 rtl:right-auto">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          {/* Logo placeholder - text for now */}
          <h1 className="text-3xl font-bold text-primary-600">
            {APP_CONSTANTS.APP_TITLE || 'RAFIQ'}
          </h1>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-ink">
          {t('login')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-stroke">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
