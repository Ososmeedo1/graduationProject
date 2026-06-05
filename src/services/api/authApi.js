import axios from 'axios';
import { APP_CONSTANTS } from '../../config/constants';
import { storage } from '../../utils/storage';

const authClient = axios.create({
  baseURL: APP_CONSTANTS.AUTH_API_BASE_URL || APP_CONSTANTS.API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authHeaders = () => {
  const token = storage.getToken();
  if (!token) {
    return undefined;
  }

  const normalized = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  return { Authorization: normalized };
};

// Step 1: Verify Password
export const login = async (email, password) => {
  const response = await authClient.post('/api/AdminAuth/verify-password', { email, password });
  return response;
};

// Step 2: Verify OTP
export const verifyOtp = async (email, code) => {
  const response = await authClient.post('/api/AdminAuth/verify-otp', { email, code });
  return response;
};

export const logout = async () => {
  // Client-side logout mostly, but if API has endpoint:
  // return await axios.post('/auth/logout');
  return Promise.resolve();
};

export const me = async () => {
  const response = await authClient.get('/api/AdminAuth/me', {
    headers: authHeaders(),
  });
  return response;
};

export const forgotPassword = async (email) => {
  return await authClient.post('/api/AdminAuth/forgot-password', { email });
};

export const checkEmail = async (email) => {
  return await authClient.post('/api/AdminAuth/check-email', { email });
};

export const googleLogin = async (email) => {
  return await authClient.post('/api/AdminAuth/google-login', { email });
};

export const resetPassword = async (emailOrToken, codeOrPassword, maybeNewPassword) => {
  // Swagger path: reset with email + code + newPassword.
  if (typeof maybeNewPassword === 'string') {
    return await authClient.post('/api/AdminAuth/reset-password', {
      email: emailOrToken,
      code: codeOrPassword,
      newPassword: maybeNewPassword,
    });
  }

  // Backward compatibility for existing token/password callers.
  return await authClient.post('/api/AdminAuth/reset-password', {
    token: emailOrToken,
    code: codeOrPassword,
    password: codeOrPassword,
    newPassword: codeOrPassword,
  });
};

export const resendOtp = async (email) => {
  return await authClient.post('/api/AdminAuth/resend-otp', { email });
};

export const changePassword = async (currentPassword, newPassword) => {
  return await authClient.post(
    '/api/AdminAuth/change-password',
    { currentPassword, newPassword },
    { headers: authHeaders() }
  );
};
