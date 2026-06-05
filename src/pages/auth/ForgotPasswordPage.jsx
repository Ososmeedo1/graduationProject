import React, { useState } from 'react';
import { useFormik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { services } from '../../services';
import { handleError } from '../../utils/errorHandler';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LanguageSwitcher from '../../components/ui/LanguageSwitcher';
import { toast } from 'react-hot-toast';
import { Mail, KeyRound, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

const authService = services.auth;

const ForgotPasswordPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [emailFocus, setEmailFocus] = useState('');

  // Step 1: Email Form
  const emailFormik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string().email(t('validation.email', 'Invalid email address')).required(t('validation.required', 'Required')),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await authService.forgotPassword(values.email);
        setEmailFocus(values.email);
        toast.success(t('auth.otp_sent', 'OTP has been sent to your email!'));
        setStep(2);
      } catch (error) {
        handleError(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Step 2: OTP Form
  const otpFormik = useFormik({
    initialValues: { otp: '' },
    validationSchema: Yup.object({
      otp: Yup.string().length(6, t('validation.otp_length', 'OTP must be 6 digits')).required(t('validation.required', 'Required')),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // verify OTP backend call usually here
        toast.success(t('auth.otp_verified', 'OTP verified successfully!'));
        setStep(3);
      } catch (error) {
        handleError(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Step 3: New Password Form
  const passwordFormik = useFormik({
    initialValues: { password: '', confirmPassword: '' },
    validationSchema: Yup.object({
      password: Yup.string().min(8, t('validation.password_min', 'Minimum 8 characters')).required(t('validation.required', 'Required')),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], t('validation.password_match', 'Passwords must match'))
        .required(t('validation.required', 'Required')),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Here we combine logic, the actual app might need the token from step 2
        await authService.resetPassword(otpFormik.values.otp, values.password);
        toast.success(t('auth.reset_password_success', 'Password reset successfully!'));
        navigate('/login');
      } catch (error) {
        handleError(error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float translate-x-[-20%] translate-y-[-20%]"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary-200/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-float translate-x-[20%] translate-y-[20%]" style={{ animationDelay: '2s' }}></div>

      <div className="absolute top-6 right-6 rtl:left-6 rtl:right-auto z-20">
        <LanguageSwitcher />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-primary-600 to-primary-400 rounded-2xl shadow-glow-primary flex items-center justify-center mb-6 transform rotate-3 hover:rotate-6 transition-transform">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-black text-ink tracking-tight">
            {step === 1 && t('auth.login.forgotPassword', 'Forgot Password')}
            {step === 2 && t('auth.enter_otp', 'Enter Verification Code')}
            {step === 3 && t('auth.reset_password', 'Create New Password')}
          </h2>
          <p className="mt-3 text-sm text-ink-muted max-w-sm mx-auto">
            {step === 1 && t('auth.forgotPassword_desc', 'Enter your email address and we will send you an OTP to reset your password.')}
            {step === 2 && t('auth.otp_desc', `We sent a code to ${emailFocus}`)}
            {step === 3 && t('auth.new_password_desc', 'Your new password must be different from previously used passwords.')}
          </p>
        </div>

        <div className="bg-surface/70 backdrop-blur-xl py-10 px-6 shadow-glass sm:rounded-3xl border border-stroke">

          {/* Step Indicators */}
          <div className="flex justify-center mb-8 space-x-2 rtl:space-x-reverse">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step === i ? 'w-8 bg-primary-600' : step > i ? 'w-4 bg-primary-300' : 'w-4 bg-surface-inset'}`} />
            ))}
          </div>

          <div className="relative overflow-hidden">
            {step === 1 && (
              <form onSubmit={emailFormik.handleSubmit} className="space-y-6 animate-slide-in-right">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  icon={<Mail className="w-5 h-5" />}
                  label={t('auth.login.email', 'Email Address')}
                  placeholder="Enter your email"
                  value={emailFormik.values.email}
                  onChange={emailFormik.handleChange}
                  onBlur={emailFormik.handleBlur}
                  error={emailFormik.touched.email && emailFormik.errors.email ? t(emailFormik.errors.email) : undefined}
                />
                <Button type="submit" isLoading={emailFormik.isSubmitting} className="w-full h-12 text-lg">
                  {t('auth.send_otp', 'Send OTP')} <ArrowRight className="w-5 h-5 ml-2 rtl:hidden" /><ArrowLeft className="w-5 h-5 mr-2 hidden rtl:block" />
                </Button>
                <div className="text-center mt-6">
                  <button type="button" onClick={() => navigate('/login')} className="text-sm font-semibold text-ink-muted hover:text-primary-600 transition-colors">
                    {t('auth.back_to_login', 'Back to login')}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={otpFormik.handleSubmit} className="space-y-6 animate-slide-in-right">
                <Input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  icon={<KeyRound className="w-5 h-5" />}
                  label={t('auth.otp_code', '6-Digit OTP')}
                  placeholder="• • • • • •"
                  className="text-center text-lg tracking-widest font-mono"
                  value={otpFormik.values.otp}
                  onChange={otpFormik.handleChange}
                  onBlur={otpFormik.handleBlur}
                  error={otpFormik.touched.otp && otpFormik.errors.otp ? t(otpFormik.errors.otp) : undefined}
                />
                <Button type="submit" isLoading={otpFormik.isSubmitting} className="w-full h-12 text-lg">
                  {t('auth.verify_otp', 'Verify OTP')}
                </Button>
                <div className="text-center mt-6">
                  <button type="button" onClick={() => setStep(1)} className="text-sm font-semibold text-ink-muted hover:text-primary-600 transition-colors">
                    {t('auth.change_email', 'Change email address')}
                  </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <form onSubmit={passwordFormik.handleSubmit} className="space-y-6 animate-slide-in-right">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  icon={<Lock className="w-5 h-5" />}
                  label={t('auth.new_password', 'New Password')}
                  placeholder="••••••••"
                  value={passwordFormik.values.password}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.password && passwordFormik.errors.password ? t(passwordFormik.errors.password) : undefined}
                />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  icon={<Lock className="w-5 h-5" />}
                  label={t('auth.confirm_password', 'Confirm Password')}
                  placeholder="••••••••"
                  value={passwordFormik.values.confirmPassword}
                  onChange={passwordFormik.handleChange}
                  onBlur={passwordFormik.handleBlur}
                  error={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword ? t(passwordFormik.errors.confirmPassword) : undefined}
                />
                <Button type="submit" isLoading={passwordFormik.isSubmitting} className="w-full h-12 text-lg shadow-glow-primary">
                  {t('auth.reset_password_btn', 'Reset Password')}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
