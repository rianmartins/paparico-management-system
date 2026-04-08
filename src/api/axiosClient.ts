import axios, { AxiosHeaders } from 'axios';

import { isUnauthorizedApiError, normalizeApiError } from '@/api/errors';
import { clearStoredSession, getStoredSession } from '@/auth/session';

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

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = normalizeApiError(error);

    if (isUnauthorizedApiError(normalizedError)) {
      clearStoredSession();
    }

    return Promise.reject(normalizedError);
  }
);

export function getAxiosClient() {
  return axiosClient;
}

export { axiosClient };
