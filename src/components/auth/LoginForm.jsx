import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Key } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { services } from '../../services';
import DirectionalWrapper from '../ui/DirectionalWrapper';
import useSound from '../../hooks/useSound';

const STEPS = {
  LOGIN: 'login',
  OTP: 'otp',
  FORGOT: 'forgot',
  RESET_OTP: 'reset_otp',
};

const getAuthErrorMessage = (error, t) => {
  const status = error?.status || error?.response?.status;
  const detail = error?.detail || error?.response?.data?.detail || error?.message;

  if (status === 404) {
    return t('auth.adminNotFound', 'Admin account not found for this email.');
  }

  if (status === 400) {
    return t('auth.invalidOrExpiredCode', 'Invalid or expired verification code.');
  }

  return detail || t('errors.updateFailed', 'Failed to update');
};

const LoginForm = () => {
  const { t } = useTranslation();
  const { login, verifyOtp } = useAuth();
  const { play, requestEntrySound } = useSound();
  const navigate = useNavigate();
  const [step, setStep] = useState(STEPS.LOGIN);
  const [loading, setLoading] = useState(false);
  const [emailForOtp, setEmailForOtp] = useState('');
  const [resendTimer, setResendTimer] = useState(30);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  useEffect(() => {
    if (step !== STEPS.OTP && step !== STEPS.RESET_OTP) return;
    if (resendTimer <= 0) return;

    const timer = window.setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [step, resendTimer]);

  useEffect(() => {
    requestEntrySound();
  }, [requestEntrySound]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || !emailForOtp) return;

    setLoading(true);
    try {
      await services.auth.resendOtp(emailForOtp);
      play('success');
      toast.success(t('auth.otpResent', 'OTP resent successfully'));
      setResendTimer(30);
    } catch (error) {
      play('error');
      toast.error(error?.detail || error?.message || t('errors.updateFailed', 'Failed to update'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error(t('validation.required', 'Required'));
      return;
    }

    setLoading(true);
    try {
      await services.auth.forgotPassword(forgotEmail);
      play('success');
      setEmailForOtp(forgotEmail);
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setResendTimer(30);
      toast.success(t('auth.resetCodeSent', 'Reset code sent to your email.'));
      setStep(STEPS.RESET_OTP);
    } catch (error) {
      play('error');
      toast.error(getAuthErrorMessage(error, t));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!emailForOtp || !resetCode || !newPassword || !confirmNewPassword) {
      toast.error(t('validation.required', 'Required'));
      return;
    }

    if (!/^\d{6}$/.test(String(resetCode).trim())) {
      toast.error(t('auth.invalidResetCodeFormat', 'Please enter a valid 6-digit code.'));
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error(t('validation.passwordMatch', 'Passwords do not match'));
      return;
    }

    setLoading(true);
    try {
      await services.auth.resetPassword(emailForOtp, resetCode, newPassword);
      play('success');
      toast.success(t('auth.passwordResetSuccess', 'Password reset successful. Please sign in.'));
      setStep(STEPS.LOGIN);
      setForgotEmail('');
      setEmailForOtp('');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setResendTimer(30);
    } catch (error) {
      play('error');
      toast.error(getAuthErrorMessage(error, t));
    } finally {
      setLoading(false);
    }
  };

  // Login Form
  const loginFormik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string().email(t('validation.email', 'Invalid email')).required(t('validation.required', 'Required')),
      password: Yup.string().required(t('validation.required', 'Required')),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const result = await login(values.email, values.password);
        if (result && result.action === 'go_to_otp_page') {
          play('success');
          setEmailForOtp(values.email);
          setResendTimer(30);
          setStep(STEPS.OTP);
        } else if (result && result.success) {
          play('login');
          toast.success(t('auth.loginSuccess', 'Login successful!'));
          navigate('/');
        }
      } catch {
        play('error');
      } finally {
        setLoading(false);
      }
    },
  });

  // OTP Form
  const otpFormik = useFormik({
    initialValues: {
      otp: ''
    },
    validationSchema: Yup.object({
      otp: Yup.string().required(t('validation.required', 'Required'))
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const result = await verifyOtp(emailForOtp, values.otp);
        if (result && result.success) {
          play('login');
          toast.success(t('auth.loginSuccess', 'Login successful!'));
          navigate('/');
        }
      } catch {
        play('error');
      } finally {
        setLoading(false);
      }
    }
  });

  if (step === STEPS.OTP) {
    return (
      <DirectionalWrapper>
        <form onSubmit={otpFormik.handleSubmit} className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-ink">{t('auth.enterOtp', 'Enter OTP')}</h3>
            <p className="text-sm text-ink-muted">{t('auth.otpSentTo', 'We sent a code to')} {emailForOtp}</p>
          </div>

          <Input
            label={t('auth.otp', 'Verification Code')}
            name="otp"
            value={otpFormik.values.otp}
            onChange={otpFormik.handleChange}
            onBlur={otpFormik.handleBlur}
            error={otpFormik.touched.otp && otpFormik.errors.otp}
            icon={<Key size={18} />}
            placeholder="0000"
            autoFocus
          />

          <Button type="submit" className="w-full" isLoading={loading}>
            {t('auth.verify', 'Verify Code')}
          </Button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading || resendTimer > 0}
            className="w-full rounded-md border border-stroke bg-surface-inset px-3 py-2 text-sm font-medium text-ink-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendTimer > 0
              ? t('auth.resendIn', 'Resend in {{time}}', { time: formatTimer(resendTimer) })
              : t('auth.resendOtp', 'Resend OTP')}
          </button>

          <button
            type="button"
            onClick={() => setStep(STEPS.LOGIN)}
            className="w-full text-center text-sm text-ink-muted hover:text-ink mt-4 underline"
          >
            {t('common.back', 'Back to Login')}
          </button>
        </form>
      </DirectionalWrapper>
    );
  }

  if (step === STEPS.FORGOT) {
    return (
      <DirectionalWrapper>
        <form onSubmit={handleForgotPassword} className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-ink">{t('auth.forgotPassword', 'Forgot your password?')}</h3>
            <p className="text-sm text-ink-muted">{t('auth.forgotPasswordHint', 'Enter your email to receive a reset code.')}</p>
          </div>

          <Input
            label={t('auth.email', 'Email Address')}
            name="forgotEmail"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            icon={<Mail size={18} />}
            autoFocus
          />

          <Button type="submit" className="w-full" isLoading={loading}>
            {t('auth.sendReset', 'Send Reset Code')}
          </Button>

          <button
            type="button"
            onClick={() => setStep(STEPS.LOGIN)}
            className="w-full text-center text-sm text-ink-muted hover:text-ink underline"
          >
            {t('common.back', 'Back to Login')}
          </button>
        </form>
      </DirectionalWrapper>
    );
  }

  if (step === STEPS.RESET_OTP) {
    return (
      <DirectionalWrapper>
        <form onSubmit={handleResetPassword} className="space-y-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-medium text-ink">{t('auth.resetPasswordTitle', 'Reset Password')}</h3>
            <p className="text-sm text-ink-muted">{t('auth.otpSentTo', 'We sent a code to')} {emailForOtp}</p>
          </div>

          <Input
            label={t('auth.otp', 'Verification Code')}
            name="resetCode"
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
            icon={<Key size={18} />}
            placeholder="123456"
            maxLength={6}
            autoFocus
          />

          <Input
            label={t('auth.newPassword', 'New Password')}
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            icon={<Lock size={18} />}
          />

          <Input
            label={t('auth.confirmPassword', 'Confirm New Password')}
            name="confirmNewPassword"
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            icon={<Lock size={18} />}
          />

          <Button type="submit" className="w-full" isLoading={loading}>
            {t('auth.resetPassword', 'Reset Password')}
          </Button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={loading || resendTimer > 0}
            className="w-full rounded-md border border-stroke bg-surface-inset px-3 py-2 text-sm font-medium text-ink-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            {resendTimer > 0
              ? t('auth.resendIn', 'Resend in {{time}}', { time: formatTimer(resendTimer) })
              : t('auth.resendOtp', 'Resend OTP')}
          </button>

          <button
            type="button"
            onClick={() => setStep(STEPS.LOGIN)}
            className="w-full text-center text-sm text-ink-muted hover:text-ink underline"
          >
            {t('common.back', 'Back to Login')}
          </button>
        </form>
      </DirectionalWrapper>
    );
  }

  return (
    <DirectionalWrapper>
      <form onSubmit={loginFormik.handleSubmit} className="space-y-6">
        <Input
          label={t('auth.email', 'Email Address')}
          name="email"
          type="email"
          value={loginFormik.values.email}
          onChange={loginFormik.handleChange}
          onBlur={loginFormik.handleBlur}
          error={loginFormik.touched.email && loginFormik.errors.email}
          icon={<Mail size={18} />}
        />

        <div>
          <Input
            label={t('auth.password', 'Password')}
            name="password"
            type="password"
            value={loginFormik.values.password}
            onChange={loginFormik.handleChange}
            onBlur={loginFormik.handleBlur}
            error={loginFormik.touched.password && loginFormik.errors.password}
            icon={<Lock size={18} />}
          />
          <div className="flex justify-end mt-1">
            <button
              type="button"
              onClick={() => {
                setForgotEmail(loginFormik.values.email || '');
                setEmailForOtp(loginFormik.values.email || '');
                setResendTimer(30);
                setStep(STEPS.FORGOT);
              }}
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              {t('auth.forgotPassword', 'Forgot your password?')}
            </button>
          </div>
        </div>

        <Button type="submit" className="w-full" isLoading={loading}>
          {t('auth.login.submit', 'Sign in')}
        </Button>
      </form>
    </DirectionalWrapper>
  );
};

export default LoginForm;
