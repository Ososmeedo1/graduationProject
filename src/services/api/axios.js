import axios from 'axios';
import { APP_CONSTANTS } from '../../config/constants';

const normalizeApiBaseUrl = (rawBaseUrl = '') => {
  const value = String(rawBaseUrl || '').trim().replace(/\/+$/, '');
  if (!value) return '/api';
  if (value.endsWith('/api')) return value;
  return `${value}/api`;
};

const instance = axios.create({
  baseURL: normalizeApiBaseUrl(APP_CONSTANTS.API_BASE_URL),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

export default instance;
