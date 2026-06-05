// Placeholder for Reset Password Page
// Logic mirrors Forgot Password but requires token validation
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import { services } from '../../services';
import { validators, createSchema } from '../../utils/validators';
import { handleError } from '../../utils/errorHandler';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { toast } from 'react-hot-toast';

const authService = services.auth;

const ResetPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema: createSchema({
      password: validators.password,
      confirmPassword: validators.password // Ideally assume 'match' check here
    }),
    onSubmit: async (values, { setSubmitting }) => {
      if (!token) {
        toast.error('Invalid token');
        return;
      }
      try {
        await authService.resetPassword(token, values.password);
        toast.success(t('auth.reset_password_success', 'Password reset successfully'));
        navigate('/login');
      } catch (error) {
        handleError(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-[var(--app-bg)] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-ink">
          {t('auth.reset_password', 'Reset Password')}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-stroke">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            <Input
              id="password"
              name="password"
              type="password"
              label={t('auth.new_password', 'New Password')}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password ? t(formik.errors.password) : undefined}
            />

            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              label={t('auth.confirm_password', 'Confirm Password')}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.confirmPassword ? t(formik.errors.confirmPassword) : undefined}
            />

            <Button
              type="submit"
              isLoading={formik.isSubmitting}
              className="w-full"
            >
              {t('common.save')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
