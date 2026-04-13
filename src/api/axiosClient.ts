import axios, { AxiosHeaders } from 'axios';
import type { AxiosRequestConfig } from 'axios';

import { isUnauthorizedApiError, normalizeApiError } from '@/api/errors';
import { clearStoredSession, getStoredSession } from '@/features/Auth/session';

declare module 'axios' {
  export interface AxiosRequestConfig {
    skipUnauthorizedSessionClear?: boolean;
  }
}

type SessionAwareRequestConfig = AxiosRequestConfig & {
  skipUnauthorizedSessionClear?: boolean;
};

function getApiBaseUrl() {
  const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseURL) {
    throw new Error('Missing NEXT_PUBLIC_API_BASE_URL environment variable.');
  }

  return baseURL;
}

const axiosClient = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use((config) => {
  const session = getStoredSession();

  if (session?.accessToken) {
    const headers = AxiosHeaders.from(config.headers);

    headers.set('Authorization', `Bearer ${session.accessToken}`);
    config.headers = headers;
  }

  return config;
});

function shouldClearStoredSession(normalizedError: unknown, originalError: unknown) {
  if (!isUnauthorizedApiError(normalizedError)) {
    return false;
  }

  if (axios.isAxiosError(originalError)) {
    const requestConfig = originalError.config as SessionAwareRequestConfig | undefined;

    return requestConfig?.skipUnauthorizedSessionClear !== true;
  }

  return true;
}

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = normalizeApiError(error);

    if (shouldClearStoredSession(normalizedError, error)) {
      clearStoredSession();
    }

    return Promise.reject(normalizedError);
  }
);

export function getAxiosClient() {
  return axiosClient;
}

export { axiosClient };
