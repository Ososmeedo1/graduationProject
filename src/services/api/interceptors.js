import instance from './axios';
import { storage } from '../../utils/storage';
import i18n from '../../services/i18n';

const MAX_RETRIES = 2;
const BASE_RETRY_DELAY_MS = 300;

const publishApiStatus = (connected) => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('api:status', {
      detail: {
        connected,
        timestamp: Date.now(),
      },
    })
  );
};

const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

const isRetriable = (error) => {
  const config = error?.config || {};
  const method = String(config.method || 'get').toLowerCase();
  const status = error?.response?.status;

  // Restrict automatic retries to GET to avoid duplicating write operations.
  if (method !== 'get') return false;

  return !status || status >= 500;
};

const normalizeBearerToken = (token) => {
  if (!token) return null;
  if (token.startsWith('Bearer ')) return token;
  return `Bearer ${token}`;
};

const normalizeApiError = (error) => {
  const response = error?.response;
  if (!response) {
    return {
      status: 0,
      title: 'Network Error',
      detail: 'Unable to connect to the server.',
      code: 'NETWORK_ERROR',
    };
  }

  const payload = response.data || {};
  return {
    ...payload,
    status: response.status,
    title: payload.title || 'Request Failed',
    detail: payload.detail || payload.message || 'The request could not be completed.',
    code: response.status === 401 ? 'UNAUTHORIZED' : 'API_ERROR',
  };
};

// Request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = normalizeBearerToken(storage.getToken());
    if (token) {
      config.headers.Authorization = token;
    }

    // Add language header
    config.headers['Accept-Language'] = i18n.language;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
instance.interceptors.response.use(
  (response) => {
    publishApiStatus(true);
    return response.data;
  },
  async (error) => {
    if (isRetriable(error)) {
      const config = error.config || {};
      const retryCount = Number(config.__retryCount || 0);

      if (retryCount < MAX_RETRIES) {
        config.__retryCount = retryCount + 1;
        const jitter = Math.floor(Math.random() * 120);
        const delay = BASE_RETRY_DELAY_MS * Math.pow(2, retryCount) + jitter;

        await sleep(delay);
        return instance(config);
      }
    }

    if (!error?.response) {
      publishApiStatus(false);
    }

    const normalized = normalizeApiError(error);

    if (normalized.status === 401) {
      storage.clear();
      if (instance?.defaults?.headers?.common) {
        delete instance.defaults.headers.common.Authorization;
      }
    }

    return Promise.reject(normalized);
  }
);
